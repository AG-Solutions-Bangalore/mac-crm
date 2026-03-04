import Login from "@/app/auth/login";
import BannerList from "@/app/banner/banner-list";
import CreateBanner from "@/app/banner/create-banner";
import EditBanner from "@/app/banner/edit-banner";
import BlogList from "@/app/blog/blog-list";
import CreateBlog from "@/app/blog/create-blog";
import CompanyList from "@/app/company/company-list";
import CountryList from "@/app/country/country";
import NotFound from "@/app/errors/not-found";
import FaqForm from "@/app/faq/create-faq";
import FaqList from "@/app/faq/faq-list";
import GalleryList from "@/app/gallery/gallery-list";
import LectureYoutubeForm from "@/app/lecture-youtube/lecture-youtube-form";
import LetureYoutubeList from "@/app/lecture-youtube/lecture-youtube-list";
import NewsLetter from "@/app/newsletter/news-letter";
import PopupList from "@/app/popup/popup";
import Settings from "@/app/setting/setting";
import SidePopupList from "@/app/sidepopup/sidepopup-list";
import StudentCertificate from "@/app/student/student-certificate";
import StudentForm from "@/app/student/student-form";
import StudentMap from "@/app/student/student-map";
import StudentOfficeImage from "@/app/student/student-officeimage";
import StudentRecentPassOut from "@/app/student/student-recentpassout";
import StudentStory from "@/app/student/student-story";
import StudentTestimonial from "@/app/student/student-testimonial";
import StudenTop from "@/app/student/student-top";
import StudentYoutube from "@/app/student/student-youtube";
import Maintenance from "@/components/common/maintenance";
import ErrorBoundary from "@/components/error-boundry/error-boundry";
import LoadingBar from "@/components/loader/loading-bar";
import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import EditBlog from "../app/blog/edit-blog";
import AuthRoute from "./auth-route";
import ProtectedRoute from "./protected-route";
import StudenScreenShot from "@/app/student/student-screenshot";
import LetureYoutubePlayList from "@/app/leture-youtube-playlist/lecture-youtubeplaylist-list";

function AppRoutes() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<AuthRoute />}>
          <Route path="/" element={<Login />} />
          {/* <Route
            path="/forgot-password"
            element={
              <Suspense fallback={<LoadingBar />}>
                <ForgotPassword />
              </Suspense>
            }
          /> */}
          <Route path="/maintenance" element={<Maintenance />} />
        </Route>

        <Route path="/" element={<ProtectedRoute />}>
          <Route
            path="/newsletter-list"
            element={
              <Suspense fallback={<LoadingBar />}>
                <NewsLetter />
              </Suspense>
            }
          />
          <Route
            path="/country-list"
            element={
              <Suspense fallback={<LoadingBar />}>
                <CountryList />
              </Suspense>
            }
          />
          <Route
            path="/youtube-playlist"
            element={
              <Suspense fallback={<LoadingBar />}>
                <LetureYoutubePlayList />
              </Suspense>
            }
          />
          <Route
            path="/lecture-youtube"
            element={
              <Suspense fallback={<LoadingBar />}>
                <LetureYoutubeList />
              </Suspense>
            }
          />
          <Route
            path="/lecture-youtube/create"
            element={
              <Suspense fallback={<LoadingBar />}>
                <LectureYoutubeForm />
              </Suspense>
            }
          />
          <Route
            path="/lecture-youtube/:id/edit"
            element={
              <Suspense fallback={<LoadingBar />}>
                <LectureYoutubeForm />
              </Suspense>
            }
          />
          <Route
            path="/student-testimonial"
            element={
              <Suspense fallback={<LoadingBar />}>
                <StudentTestimonial />
              </Suspense>
            }
          />
          <Route
            path="/student-youtube"
            element={
              <Suspense fallback={<LoadingBar />}>
                <StudentYoutube />
              </Suspense>
            }
          />
          <Route
            path="/student-certificate"
            element={
              <Suspense fallback={<LoadingBar />}>
                <StudentCertificate />
              </Suspense>
            }
          />
          <Route
            path="/student-story"
            element={
              <Suspense fallback={<LoadingBar />}>
                <StudentStory />
              </Suspense>
            }
          />
          <Route
            path="/student-recent-passout"
            element={
              <Suspense fallback={<LoadingBar />}>
                <StudentRecentPassOut />
              </Suspense>
            }
          />
          <Route
            path="/student-map"
            element={
              <Suspense fallback={<LoadingBar />}>
                <StudentMap />
              </Suspense>
            }
          />
          <Route
            path="/student-top"
            element={
              <Suspense fallback={<LoadingBar />}>
                <StudenTop />
              </Suspense>
            }
          />
          <Route
            path="/student-screenshot"
            element={
              <Suspense fallback={<LoadingBar />}>
                <StudenScreenShot />
              </Suspense>
            }
          />
          <Route
            path="/student-top"
            element={
              <Suspense fallback={<LoadingBar />}>
                <StudenTop />
              </Suspense>
            }
          />
          <Route
            path="/student-officeimage"
            element={
              <Suspense fallback={<LoadingBar />}>
                <StudentOfficeImage />
              </Suspense>
            }
          />
          <Route
            path="/student/create"
            element={
              <Suspense fallback={<LoadingBar />}>
                <StudentForm />
              </Suspense>
            }
          />
          <Route
            path="/student/:id/edit"
            element={
              <Suspense fallback={<LoadingBar />}>
                <StudentForm />
              </Suspense>
            }
          />

          <Route
            path="/popup-list"
            element={
              <Suspense fallback={<LoadingBar />}>
                <PopupList />
              </Suspense>
            }
          />
          <Route
            path="/side-popup-list"
            element={
              <Suspense fallback={<LoadingBar />}>
                <SidePopupList />
              </Suspense>
            }
          />

          <Route
            path="/banner-list"
            element={
              <Suspense fallback={<LoadingBar />}>
                <BannerList />
              </Suspense>
            }
          />
          <Route
            path="/add-banner"
            element={
              <Suspense fallback={<LoadingBar />}>
                <CreateBanner />
              </Suspense>
            }
          />
          <Route
            path="/edit-banner/:id"
            element={
              <Suspense fallback={<LoadingBar />}>
                <EditBanner />
              </Suspense>
            }
          />
          <Route
            path="/company-list"
            element={
              <Suspense fallback={<LoadingBar />}>
                <CompanyList />
              </Suspense>
            }
          />

          <Route
            path="/faq-list"
            element={
              <Suspense fallback={<LoadingBar />}>
                <FaqList />
              </Suspense>
            }
          />
          <Route
            path="/add-faq"
            element={
              <Suspense fallback={<LoadingBar />}>
                <FaqForm />
              </Suspense>
            }
          />
          <Route
            path="/edit-faq/:id"
            element={
              <Suspense fallback={<LoadingBar />}>
                <FaqForm />
              </Suspense>
            }
          />
          <Route
            path="/settings"
            element={
              <Suspense fallback={<LoadingBar />}>
                <Settings />
              </Suspense>
            }
          />
          <Route
            path="/blog-list"
            element={
              <Suspense fallback={<LoadingBar />}>
                <BlogList />
              </Suspense>
            }
          />
          <Route
            path="/add-blog"
            element={
              <Suspense fallback={<LoadingBar />}>
                <CreateBlog />
              </Suspense>
            }
          />
          <Route
            path="/edit-blog/:id"
            element={
              <Suspense fallback={<LoadingBar />}>
                <EditBlog />
              </Suspense>
            }
          />
          <Route
            path="/gallery-list"
            element={
              <Suspense fallback={<LoadingBar />}>
                <GalleryList />
              </Suspense>
            }
          />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default AppRoutes;
