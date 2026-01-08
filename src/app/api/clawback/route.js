import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const loansFilePath = path.join(process.cwd(), 'src/data/loans.json');

const readData = (filePath) => {
  try {
    const jsonData = fs.readFileSync(filePath);
    return JSON.parse(jsonData);
  } catch (error) {
    return [];
  }
};

const writeData = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

export async function POST(request) {
  try {
    const { borrowerAddress } = await request.json();

    if (!borrowerAddress) {
      return NextResponse.json({ message: 'Borrower address is required.' }, { status: 400 });
    }

    const loans = readData(loansFilePath);
    let updatedCount = 0;

    // 1. Find all loans for this borrower
    const updatedLoans = loans.map(loan => {
      if (loan.borrowerAccount === borrowerAddress && loan.status === 'Active') {
        updatedCount++;
        // 2. Set loan status to Defaulted
        const updatedLoan = { ...loan, status: 'Defaulted' };
        
        // 3. Set pending/due installments to Terminated
        updatedLoan.installments = loan.installments.map(inst => {
          if (inst.status === 'Due' || inst.status === 'Pending') {
            return { ...inst, status: 'Terminated' };
          }
          return inst;
        });
        
        return updatedLoan;
      }
      return loan;
    });

    if (updatedCount > 0) {
      writeData(loansFilePath, updatedLoans);
    }

    return NextResponse.json({ message: `Clawback processed. ${updatedCount} loans defaulted.` }, { status: 200 });

  } catch (error) {
    console.error('Clawback API Error:', error);
    return NextResponse.json({ message: 'Error processing clawback.' }, { status: 500 });
  }
}
