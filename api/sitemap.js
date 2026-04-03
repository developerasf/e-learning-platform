import connectDB from './lib/db.js';
import Course from './models/Course.js';

export default async function handler(req, res) {
  try {
    await connectDB();

    const baseUrl = process.env.SITE_URL || 'https://bipulsclassroom.com';
    
    const courses = await Course.find({ isPublished: true })
      .select('title updatedAt')
      .lean();

    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'weekly' },
      { url: '/courses', priority: '0.9', changefreq: 'daily' },
      { url: '/login', priority: '0.5', changefreq: 'monthly' },
      { url: '/register', priority: '0.5', changefreq: 'monthly' },
    ];

    const coursePages = courses.map(course => ({
      url: `/courses/${course._id}`,
      priority: '0.7',
      changefreq: 'weekly',
      lastmod: course.updatedAt ? new Date(course.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    }));

    const allPages = [...staticPages, ...coursePages];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    ${page.lastmod ? `<lastmod>${page.lastmod}</lastmod>` : ''}
  </url>`).join('\n')}
</urlset>`;

    res.setHeader('Content-Type', 'text/xml');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.send(sitemap);

  } catch (error) {
    console.error('Sitemap error:', error);
    return res.status(500).json({ message: 'Error generating sitemap' });
  }
}