import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// The path to your JSON database file
const dataFilePath = path.join(process.cwd(), 'src/data/loans.json');

// Helper function to read the database
const readData = () => {
  try {
    const jsonData = fs.readFileSync(dataFilePath);
    // If the file is empty, return an empty array
    if (jsonData.length === 0) {
      return [];
    }
    return JSON.parse(jsonData);
  } catch (error) {
    // If file doesn't exist, return empty array
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
};

// Helper function to write to the database
const writeData = (data) => {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
};

/**
 * @param {import('next/server').NextRequest} request
 */
export async function GET(request) {
  try {
    const loans = readData();
    return NextResponse.json(loans, { status: 200 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ message: 'Error reading loan data.' }, { status: 500 });
  }
}


/**
 * @param {import('next/server').NextRequest} request
 */
export async function POST(request) {
  try {
    const loans = readData();
    const newLoan = await request.json();

    if (!newLoan || !newLoan.id) {
      return NextResponse.json({ message: 'Invalid loan data provided.' }, { status: 400 });
    }

    loans.push(newLoan);
    writeData(loans);

    return NextResponse.json({ message: 'Loan added successfully.', loan: newLoan }, { status: 201 });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ message: 'Error processing request.' }, { status: 500 });
  }
}

/**
 * @param {import('next/server').NextRequest} request
 */
export async function PUT(request) {
  try {
    const loans = readData();
    const { loanId, installmentId } = await request.json();

    const loanIndex = loans.findIndex(l => l.id === loanId);
    if (loanIndex === -1) {
      return NextResponse.json({ message: 'Loan not found.' }, { status: 404 });
    }

    const loan = loans[loanIndex];
    const installmentIndex = loan.installments.findIndex(i => i.id === installmentId);

    if (installmentIndex === -1) {
      return NextResponse.json({ message: 'Installment not found.' }, { status: 404 });
    }

    const installment = loan.installments[installmentIndex];
    const today = new Date();
    const dueDate = new Date(installment.dueDate);
    
    // Determine if late
    // We compare YYYY-MM-DD strings usually or use date objects. 
    // Assuming dueDate is YYYY-MM-DD.
    // Setting time to midnight for accurate date comparison
    today.setHours(0,0,0,0);
    dueDate.setHours(0,0,0,0);

    let newStatus = 'Paid';
    if (today > dueDate) {
      newStatus = 'Late';
    }

    loans[loanIndex].installments[installmentIndex].status = newStatus;
    
    // Find the NEXT pending installment and mark it as Due
    const nextInstallmentIndex = loans[loanIndex].installments.findIndex(i => i.status === 'Pending');
    if (nextInstallmentIndex !== -1) {
        loans[loanIndex].installments[nextInstallmentIndex].status = 'Due';
    }

    // Check if all installments are paid to update loan status
    const allPaid = loans[loanIndex].installments.every(i => i.status.includes('Paid'));
    if (allPaid) {
        loans[loanIndex].status = 'Repaid';
    }

    writeData(loans);

    return NextResponse.json({ message: 'Installment updated successfully.', loan: loans[loanIndex] }, { status: 200 });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ message: 'Error processing request.' }, { status: 500 });
  }
}
