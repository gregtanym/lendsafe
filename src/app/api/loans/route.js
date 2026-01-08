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
