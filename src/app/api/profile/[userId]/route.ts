import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma';

const prisma = new PrismaClient();

// GET - Fetch user profile
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      include: {
        awards: true,
        publications: true,
        recognitions: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Transform data to match component structure
    const profileData = {
      name: user.name,
      title: user.title,
      bio: user.bio,
      image: user.image,
      email: user.email,
      location: user.location,
      website: user.website,
      social: {
        twitter: user.twitterHandle,
        instagram: user.instagramHandle,
        facebook: user.facebookHandle,
      },
      about: {
        education: user.education,
        experience: user.experience,
        interests: user.interests,
      },
      stats: {
        writings: user.writingsCount,
        photos: user.photosCount,
        followers: user.followersCount,
      },
      achievements: {
        awards: user.awards.map(award => award.description),
        publications: user.publications.map(pub => ({
          title: pub.title,
          description: pub.description,
        })),
        recognition: user.recognitions.map(rec => rec.description),
      },
    };

    return NextResponse.json(profileData);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

// PUT - Update user profile
export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const data = await request.json();

    // Start a transaction to update all related data
    const result = await prisma.$transaction(async (tx) => {
      // Update main user data
      const updatedUser = await tx.user.update({
        where: { id: params.userId },
        data: {
          name: data.name,
          title: data.title,
          bio: data.bio,
          image: data.image,
          email: data.email,
          location: data.location,
          website: data.website,
          twitterHandle: data.social?.twitter,
          instagramHandle: data.social?.instagram,
          facebookHandle: data.social?.facebook,
          education: data.about?.education,
          experience: data.about?.experience,
          interests: data.about?.interests,
        },
      });

      // Update awards
      if (data.achievements?.awards) {
        await tx.award.deleteMany({ where: { userId: params.userId } });
        await tx.award.createMany({
          data: data.achievements.awards
            .filter((award: string) => award.trim() !== '')
            .map((description: string) => ({
              description,
              userId: params.userId,
            })),
        });
      }

      // Update publications
      if (data.achievements?.publications) {
        await tx.publication.deleteMany({ where: { userId: params.userId } });
        await tx.publication.createMany({
          data: data.achievements.publications
            .filter((pub: any) => pub.title.trim() !== '' || pub.description.trim() !== '')
            .map((pub: any) => ({
              title: pub.title,
              description: pub.description,
              userId: params.userId,
            })),
        });
      }

      // Update recognitions
      if (data.achievements?.recognition) {
        await tx.recognition.deleteMany({ where: { userId: params.userId } });
        await tx.recognition.createMany({
          data: data.achievements.recognition
            .filter((rec: string) => rec.trim() !== '')
            .map((description: string) => ({
              description,
              userId: params.userId,
            })),
        });
      }

      return updatedUser;
    });

    return NextResponse.json({ message: 'Profile updated successfully', user: result });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}