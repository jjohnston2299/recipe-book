# Recipe Book

A modern recipe management application built with Next.js 14, MongoDB, and Cloudflare Images.

## Features

- 📱 Responsive design that works on desktop and mobile
- 🔍 Advanced filtering system:
  - Search by recipe name
  - Filter by cuisine type
  - Filter by preparation time
  - Filter by tags
- 📸 Image upload support via Cloudflare
- 🏷️ Tag-based organization
- ⏱️ Preparation and cooking time tracking
- 🎨 Beautiful, consistent design with a custom color scheme:
  - Primary: #819A91 (muted sage green)
  - Secondary: #A7C1A8 (lighter sage green)
  - Accent: #D1D8BE (sage beige)
  - Background: #F5F6F0 (off-white)

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Database**: MongoDB
- **Styling**: Tailwind CSS
- **Image Storage**: Cloudflare Images
- **Deployment**: Vercel (recommended)

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/recipe-book.git
   cd recipe-book
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
   CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `/app` - Next.js 14 app directory containing all routes and layouts
- `/components` - Reusable React components
- `/lib` - Utility functions and database configuration
- `/public` - Static assets
- `/styles` - Global styles and Tailwind CSS configuration

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
 