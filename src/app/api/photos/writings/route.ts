// app/api/writings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma'

const prisma = new PrismaClient();

// GET /api/writings - Fetch all writings
export async function GET() {
  try {
    const writings = await prisma.writing.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(writings);
  } catch