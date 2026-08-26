import LoginPage from "@/modules/auth/pages/LoginPage";
import ForgotPasswordPage from "@/modules/auth/pages/ForgotPasswordPage";
import BlogListPage from "@/modules/blog/pages/BlogListPage";
import BlogCreatePage from "@/modules/blog/pages/BlogCreatePage";
import NotFound from "@/app/errors/not-found";
import FaqFormPage from "@/modules/faq/pages/FaqFormPage";
import FaqListPage from "@/modules/faq/pages/FaqListPage";
import GalleryListPage from "@/modules/gallery/pages/GalleryListPage";
import LectureFormPage from "@/modules/lecture-youtube/pages/LectureFormPage";
import LectureListPage from "@/modules/lecture-youtube/pages/LectureListPage";
import PlaylistListPage from "@/modules/lecture-youtube/pages/PlaylistListPage";
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
import BlogEditPage from "@/modules/blog/pages/BlogEditPage";
import AuthRoute from "./auth-route";
import ProtectedRoute from "./protected-route";
import StudenScreenShot from "@/app/student/student-screenshot";
import NotificationListPage from "@/modules/notification/pages/NotificationListPage";
import Dashboard from "@/app/dashboard/home";
import ServiceListPage from "@/modules/service/pages/ServiceListPage";
import ServiceFormPage from "@/modules/service/pages/ServiceFormPage";
import ClientListPage from "@/modules/client/pages/ClientListPage";
import ClientFormPage from "@/modules/client/pages/ClientFormPage";
import RequestListPage from "@/modules/service-request/pages/RequestListPage";
import Client from "@/app/reports/Client";
import Request_service from "@/app/reports/Request_service";
import QuotationReportPage from "@/modules/quotation/pages/QuotationReportPage";
import ComplaintListPage from "@/modules/complaint/pages/ComplaintListPage";

// New Modules (Modular Architecture)
import BuyerListPage from "@/modules/buyer/pages/BuyerListPage";
import BuyerFormPage from "@/modules/buyer/pages/BuyerFormPage";
import PropertyListPage from "@/modules/property/pages/PropertyListPage";
import PropertyFormPage from "@/modules/property/pages/PropertyFormPage";
import FloorListPage from "@/modules/floor/pages/FloorListPage";
import FloorFormPage from "@/modules/floor/pages/FloorFormPage";

// Area, Brand, Category Masters
import AreaListPage from "@/modules/area/pages/AreaListPage";
import AreaFormPage from "@/modules/area/pages/AreaFormPage";
import BrandListPage from "@/modules/brand/pages/BrandListPage";
import BrandFormPage from "@/modules/brand/pages/BrandFormPage";
import CategoryListPage from "@/modules/category/pages/CategoryListPage";
import CategoryFormPage from "@/modules/category/pages/CategoryFormPage";
import ProductListPage from "@/modules/product/pages/ProductListPage";
import ProductFormPage from "@/modules/product/pages/ProductFormPage";
import QuotationListPage from "@/modules/quotation/pages/QuotationListPage";
import QuotationFormPage from "@/modules/quotation/pages/QuotationFormPage";
import RevQuotationListPage from "@/modules/quotation/pages/RevQuotationListPage";
import RevQuotationFormPage from "@/modules/quotation/pages/RevQuotationFormPage";

function AppRoutes() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<AuthRoute />}>
          <Route path="/" element={<LoginPage />} />
          <Route
            path="/forgot-password"
            element={
              <Suspense fallback={<LoadingBar />}>
                <ForgotPasswordPage />
              </Suspense>
            }
          />
          <Route path="/maintenance" element={<Maintenance />} />
        </Route>

        <Route
          path="/dashboard"
          element={
            <Suspense fallback={<LoadingBar />}>
              <Dashboard />
            </Suspense>
          }
        />

        <Route path="/" element={<ProtectedRoute />}>
          <Route
            path="/service-list"
            element={
              <Suspense fallback={<LoadingBar />}>
                <ServiceListPage />
              </Suspense>
            }
          />
          <Route
            path="/service-list/create"
            element={
              <Suspense fallback={<LoadingBar />}>
                <ServiceFormPage />
              </Suspense>
            }
          />
          <Route
            path="/service-list/edit/:id"
            element={
              <Suspense fallback={<LoadingBar />}>
                <ServiceFormPage />
              </Suspense>
            }
          />

          {/* Clients */}
          <Route
            path="/client-list"
            element={
              <Suspense fallback={<LoadingBar />}>
                <ClientListPage />
              </Suspense>
            }
          />
          <Route
            path="/client-list/create"
            element={
              <Suspense fallback={<LoadingBar />}>
                <ClientFormPage />
              </Suspense>
            }
          />
          <Route
            path="/client-list/create-relation/"
            element={
              <Suspense fallback={<LoadingBar />}>
                <ClientFormPage isRelation={true} />
              </Suspense>
            }
          />
          <Route
            path="/client-list/edit/:id"
            element={
              <Suspense fallback={<LoadingBar />}>
                <ClientFormPage isEdit={true} />
              </Suspense>
            }
          />

          {/* Buyers */}
          <Route
            path="/buyer-list"
            element={
              <Suspense fallback={<LoadingBar />}>
                <BuyerListPage />
              </Suspense>
            }
          />
          <Route
            path="/buyer-list/create"
            element={
              <Suspense fallback={<LoadingBar />}>
                <BuyerFormPage />
              </Suspense>
            }
          />
          <Route
            path="/buyer-list/edit/:id"
            element={
              <Suspense fallback={<LoadingBar />}>
                <BuyerFormPage />
              </Suspense>
            }
          />

          {/* Properties */}
          <Route
            path="/property-list"
            element={
              <Suspense fallback={<LoadingBar />}>
                <PropertyListPage />
              </Suspense>
            }
          />
          <Route
            path="/property-list/create"
            element={
              <Suspense fallback={<LoadingBar />}>
                <PropertyFormPage />
              </Suspense>
            }
          />
          <Route
            path="/property-list/edit/:id"
            element={
              <Suspense fallback={<LoadingBar />}>
                <PropertyFormPage />
              </Suspense>
            }
          />

          {/* Floors */}
          <Route
            path="/floor-list"
            element={
              <Suspense fallback={<LoadingBar />}>
                <FloorListPage />
              </Suspense>
            }
          />
          <Route
            path="/floor-list/create"
            element={
              <Suspense fallback={<LoadingBar />}>
                <FloorFormPage />
              </Suspense>
            }
          />
          <Route
            path="/floor-list/edit/:id"
            element={
              <Suspense fallback={<LoadingBar />}>
                <FloorFormPage />
              </Suspense>
            }
          />

          {/* Areas */}
          <Route
            path="/area-list"
            element={
              <Suspense fallback={<LoadingBar />}>
                <AreaListPage />
              </Suspense>
            }
          />
          <Route
            path="/area-list/create"
            element={
              <Suspense fallback={<LoadingBar />}>
                <AreaFormPage />
              </Suspense>
            }
          />
          <Route
            path="/area-list/edit/:id"
            element={
              <Suspense fallback={<LoadingBar />}>
                <AreaFormPage />
              </Suspense>
            }
          />

          {/* Brands */}
          <Route
            path="/brand-list"
            element={
              <Suspense fallback={<LoadingBar />}>
                <BrandListPage />
              </Suspense>
            }
          />
          <Route
            path="/brand-list/create"
            element={
              <Suspense fallback={<LoadingBar />}>
                <BrandFormPage />
              </Suspense>
            }
          />
          <Route
            path="/brand-list/edit/:id"
            element={
              <Suspense fallback={<LoadingBar />}>
                <BrandFormPage />
              </Suspense>
            }
          />

          {/* Categories */}
          <Route
            path="/category-list"
            element={
              <Suspense fallback={<LoadingBar />}>
                <CategoryListPage />
              </Suspense>
            }
          />
          <Route
            path="/category-list/create"
            element={
              <Suspense fallback={<LoadingBar />}>
                <CategoryFormPage />
              </Suspense>
            }
          />
          <Route
            path="/category-list/edit/:id"
            element={
              <Suspense fallback={<LoadingBar />}>
                <CategoryFormPage />
              </Suspense>
            }
          />

          {/* Products */}
          <Route
            path="/product-list"
            element={
              <Suspense fallback={<LoadingBar />}>
                <ProductListPage />
              </Suspense>
            }
          />
          <Route
            path="/product-list/create"
            element={
              <Suspense fallback={<LoadingBar />}>
                <ProductFormPage />
              </Suspense>
            }
          />
          <Route
            path="/product-list/edit/:id"
            element={
              <Suspense fallback={<LoadingBar />}>
                <ProductFormPage />
              </Suspense>
            }
          />

          {/* Quotations */}
          <Route
            path="/quotation-list"
            element={
              <Suspense fallback={<LoadingBar />}>
                <QuotationListPage />
              </Suspense>
            }
          />
          <Route
            path="/quotation-list/create"
            element={
              <Suspense fallback={<LoadingBar />}>
                <QuotationFormPage />
              </Suspense>
            }
          />
          <Route
            path="/quotation-list/edit/:id"
            element={
              <Suspense fallback={<LoadingBar />}>
                <QuotationFormPage />
              </Suspense>
            }
          />

          {/* Revised Quotations */}
          <Route
            path="/quotation-list/revised/:id"
            element={
              <Suspense fallback={<LoadingBar />}>
                <RevQuotationListPage />
              </Suspense>
            }
          />
          <Route
            path="/quotation-list/revised/:id/create"
            element={
              <Suspense fallback={<LoadingBar />}>
                <RevQuotationFormPage />
              </Suspense>
            }
          />
          <Route
            path="/quotation-list/revised/:id/edit/:revId"
            element={
              <Suspense fallback={<LoadingBar />}>
                <RevQuotationFormPage />
              </Suspense>
            }
          />

          {/* Service-request */}
          <Route
            path="/service-request"
            element={
              <Suspense fallback={<LoadingBar />}>
                <RequestListPage />
              </Suspense>
            }
          />

          {/* notification */}
          <Route
            path="/notification-list"
            element={
              <Suspense fallback={<LoadingBar />}>
                <NotificationListPage />
              </Suspense>
            }
          />

          {/* Complaint */}
          <Route
            path="/complaint-list"
            element={
              <Suspense fallback={<LoadingBar />}>
                <ComplaintListPage />
              </Suspense>
            }
          />

          {/* Reports */}
          <Route
            path="/client-report"
            element={
              <Suspense fallback={<LoadingBar />}>
                <Client />
              </Suspense>
            }
          />
          <Route
            path="/service-request-report"
            element={
              <Suspense fallback={<LoadingBar />}>
                <Request_service />
              </Suspense>
            }
          />
          <Route
            path="/quotation-report/:id"
            element={
              <Suspense fallback={<LoadingBar />}>
                <QuotationReportPage />
              </Suspense>
            }
          />

          {/* old routes --------------------------------------------------------------------- */}
          <Route
            path="/lecture-youtube"
            element={
              <Suspense fallback={<LoadingBar />}>
                <LectureListPage />
              </Suspense>
            }
          />
          <Route
            path="/lecture-youtube/create"
            element={
              <Suspense fallback={<LoadingBar />}>
                <LectureFormPage />
              </Suspense>
            }
          />
          <Route
            path="/lecture-youtube/:id/edit"
            element={
              <Suspense fallback={<LoadingBar />}>
                <LectureFormPage />
              </Suspense>
            }
          />
          <Route
            path="/lecture-youtube/edit/:id"
            element={
              <Suspense fallback={<LoadingBar />}>
                <LectureFormPage />
              </Suspense>
            }
          />
          <Route
            path="/lecture-youtube-playlist"
            element={
              <Suspense fallback={<LoadingBar />}>
                <PlaylistListPage />
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

          {/* <Route
            path="/company-list"
            element={
              <Suspense fallback={<LoadingBar />}>
                <NotificationList />
              </Suspense>
            }
          /> */}

          <Route
            path="/faq-list"
            element={
              <Suspense fallback={<LoadingBar />}>
                <FaqListPage />
              </Suspense>
            }
          />
          <Route
            path="/add-faq"
            element={
              <Suspense fallback={<LoadingBar />}>
                <FaqFormPage />
              </Suspense>
            }
          />
          <Route
            path="/faq-list/create"
            element={
              <Suspense fallback={<LoadingBar />}>
                <FaqFormPage />
              </Suspense>
            }
          />
          <Route
            path="/edit-faq/:id"
            element={
              <Suspense fallback={<LoadingBar />}>
                <FaqFormPage />
              </Suspense>
            }
          />
          <Route
            path="/faq-list/edit/:id"
            element={
              <Suspense fallback={<LoadingBar />}>
                <FaqFormPage />
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
                <BlogListPage />
              </Suspense>
            }
          />
          <Route
            path="/add-blog"
            element={
              <Suspense fallback={<LoadingBar />}>
                <BlogCreatePage />
              </Suspense>
            }
          />
          <Route
            path="/blog-list/create"
            element={
              <Suspense fallback={<LoadingBar />}>
                <BlogCreatePage />
              </Suspense>
            }
          />
          <Route
            path="/edit-blog/:id"
            element={
              <Suspense fallback={<LoadingBar />}>
                <BlogEditPage />
              </Suspense>
            }
          />
          <Route
            path="/blog-list/edit/:id"
            element={
              <Suspense fallback={<LoadingBar />}>
                <BlogEditPage />
              </Suspense>
            }
          />
          <Route
            path="/gallery-list"
            element={
              <Suspense fallback={<LoadingBar />}>
                <GalleryListPage />
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
