import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminRole, logAdminAction } from '@/lib/auth';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    const formatted = categories.map(c => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      productCount: c._count.products,
      createdAt: c.createdAt
    }));

    return NextResponse.json({
      success: true,
      categories: formatted
    });
  } catch (err: any) {
    console.error('Get Categories Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdminRole(request, [
      'SUPER_ADMIN',
      'ADMIN',
      'MANAGER',
      'MARKETING'
    ]);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { name, slug } = body;

    if (!name) {
      return NextResponse.json({ error: 'Category name is required.' }, { status: 400 });
    }

    const generatedSlug = (slug || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const existing = await prisma.category.findFirst({
      where: {
        OR: [{ name: name.trim() }, { slug: generatedSlug }]
      }
    });

    if (existing) {
      return NextResponse.json({ error: 'A category with this name or slug already exists.' }, { status: 409 });
    }

    const newCategory = await prisma.category.create({
      data: {
        name: name.trim(),
        slug: generatedSlug
      }
    });

    await logAdminAction(auth.user?.id || null, `Created category "${newCategory.name}"`);

    return NextResponse.json({
      success: true,
      message: `Category "${newCategory.name}" created successfully.`,
      category: newCategory
    }, { status: 201 });
  } catch (err: any) {
    console.error('Create Category Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await requireAdminRole(request, ['SUPER_ADMIN', 'ADMIN']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required.' }, { status: 400 });
    }

    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } }
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found.' }, { status: 404 });
    }

    if (category._count.products > 0) {
      return NextResponse.json({
        error: `Cannot delete category "${category.name}" because it still contains ${category._count.products} products.`
      }, { status: 400 });
    }

    await prisma.category.delete({ where: { id } });

    await logAdminAction(auth.user?.id || null, `Deleted category "${category.name}"`);

    return NextResponse.json({
      success: true,
      message: `Category "${category.name}" deleted successfully.`
    });
  } catch (err: any) {
    console.error('Delete Category Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
