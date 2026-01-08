import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// The path to your JSON database file
const dataFilePath = path.join(process.cwd(), 'src/data/borrowers.json');

// Helper function to read the database
const readData = () => {
  const jsonData = fs.readFileSync(dataFilePath);
  return JSON.parse(jsonData);
};

// Helper function to write to the database
const writeData = (data) => {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
};

/**
 * @param {import('next/server').NextRequest} request
 */
export async function POST(request) {
  try {
    const borrowers = readData();
    const newBorrower = await request.json();

    // Basic validation
    if (!newBorrower || !newBorrower.account) {
      return NextResponse.json({ message: 'Invalid borrower data provided.' }, { status: 400 });
    }

    // Check if borrower already exists
    const existingIndex = borrowers.findIndex(b => b.account === newBorrower.account);

    if (existingIndex !== -1) {
      // Update existing borrower
      borrowers[existingIndex] = { ...borrowers[existingIndex], ...newBorrower };
    } else {
      // Add new borrower
      borrowers.push(newBorrower);
    }

    writeData(borrowers);

    return NextResponse.json({ message: 'Borrower added/updated successfully.', borrower: newBorrower }, { status: 201 });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ message: 'Error processing request.' }, { status: 500 });
  }
}
