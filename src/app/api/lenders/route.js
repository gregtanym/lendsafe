import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// The path to your JSON database file
const dataFilePath = path.join(process.cwd(), 'src/data/lenders.json');

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

/**
 * @param {import('next/server').NextRequest} request
 */
export async function GET(request) {
  try {
    const lenders = readData();
    return NextResponse.json(lenders, { status: 200 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ message: 'Error reading lender data.' }, { status: 500 });
  }
}
