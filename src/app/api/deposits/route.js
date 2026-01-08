import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// The path to your JSON database file
const dataFilePath = path.join(process.cwd(), 'src/data/deposits.json');

// Helper function to read the database
const readData = () => {
  try {
    const jsonData = fs.readFileSync(dataFilePath);
    if (jsonData.length === 0) {
      return [];
    }
    return JSON.parse(jsonData);
  } catch (error) {
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
    const deposits = readData();
    const { searchParams } = new URL(request.url);
    const account = searchParams.get('account');

    if (account) {
      const userDeposits = deposits.filter(d => d.account === account);
      return NextResponse.json(userDeposits, { status: 200 });
    }

    return NextResponse.json(deposits, { status: 200 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ message: 'Error reading deposit data.' }, { status: 500 });
  }
}

/**
 * @param {import('next/server').NextRequest} request
 */
export async function POST(request) {
  try {
    const deposits = readData();
    const newRecord = await request.json();

    if (!newRecord || !newRecord.account || !newRecord.amount || !newRecord.type) {
      return NextResponse.json({ message: 'Invalid deposit data provided.' }, { status: 400 });
    }

    // Add timestamp
    const recordWithDate = {
      id: `DEP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      ...newRecord
    };

    deposits.push(recordWithDate);
    writeData(deposits);

    return NextResponse.json({ message: 'Record added successfully.', record: recordWithDate }, { status: 201 });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ message: 'Error processing request.' }, { status: 500 });
  }
}
