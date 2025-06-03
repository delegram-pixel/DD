// app/api/photos/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '../../../../generated/prisma'

const prisma = new PrismaClient()

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params since it's now a Promise
    const { id } = await params

    // Check if photo exists
    const existingPhoto = await prisma.photo.findUnique({
      where: { id }
    })

    if (!existingPhoto) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      )
    }

    // Delete the photo
    await prisma.photo.delete({
      where: { id }
    })

    return NextResponse.json(
      { message: 'Photo deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting photo:', error)
    return NextResponse.json(
      { error: 'Failed to delete photo' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}