import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/mongodb';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Check if mongoose is connected
    const isConnected = mongoose.connection.readyState === 1;
    
    if (!isConnected) {
      return NextResponse.json({ 
        status: 'error', 
        message: 'Database not connected',
        readyState: mongoose.connection.readyState 
      }, { status: 500 });
    }

    // Get some basic stats
    const dbName = mongoose.connection.db?.databaseName || 'unknown';
    const collections = await mongoose.connection.db?.listCollections().toArray();

    return NextResponse.json({
      status: 'ok',
      database: dbName,
      collectionsCount: collections?.length || 0,
      readyState: mongoose.connection.readyState,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({ 
      status: 'error', 
      message: error.message 
    }, { status: 500 });
  }
}
