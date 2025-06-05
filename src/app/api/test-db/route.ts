import { NextResponse } from 'next/server';
import clientPromise, { getDb } from '@/lib/mongodb';

export async function GET() {
  try {
    // Debug: Check if environment variable exists
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: 'MONGODB_URI environment variable is not set' },
        { status: 500 }
      );
    }

    // Log connection attempt (hiding sensitive info)
    const uri = process.env.MONGODB_URI;
    const maskedUri = uri.replace(
      /mongodb\+srv:\/\/([^:]+):([^@]+)@/,
      'mongodb+srv://$1:****@'
    );
    console.log('Attempting to connect with URI:', maskedUri);
    
    // Use the new getDb helper function
    const db = await getDb();
    
    // Test the connection by listing collections
    const collections = await db.listCollections().toArray();
    
    return NextResponse.json({ 
      status: 'Connected successfully!',
      collections: collections.map(col => col.name),
      message: collections.length === 0 ? 
        'Database is empty, which is expected for a new setup' : 
        `Found ${collections.length} collection(s)`,
      databaseName: db.databaseName
    });
  } catch (error) {
    console.error('Database connection error:', error);
    
    // More detailed error information
    const errorDetails = error instanceof Error ? {
      message: error.message,
      name: error.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    } : 'Unknown error';

    return NextResponse.json(
      { 
        error: 'Failed to connect to database',
        details: errorDetails
      },
      { status: 500 }
    );
  }
} 