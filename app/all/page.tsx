import { Suspense } from 'react';
import AllPostsPage from "@/components/Sections/AllPosts";  

export const metadata = {
  title: 'All Posts',
};

export default function BlogPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F5F1E8]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3E4A61] mx-auto"></div>
          <p className="mt-4 text-[#5D5D5D]">Loading...</p>
        </div>
      </div>
    }>
      <AllPostsPage />
    </Suspense>
  );
}