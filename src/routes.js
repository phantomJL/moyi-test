/**
=========================================================
* Material Dashboard 3 PRO React - v2.3.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-pro-react
* Copyright 2024 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

/** 
  All of the routes for the Material Dashboard 3 PRO React are added here,
  You can add a new route, customize the routes and delete the routes here.

  Once you add a new route on this file it will be visible automatically on
  the Sidenav.

  For adding a new route you can follow the existing routes in the routes array.
  1. The `type` key with the `collapse` value is used for a route.
  2. The `type` key with the `title` value is used for a title inside the Sidenav. 
  3. The `type` key with the `divider` value is used for a divider between Sidenav items.
  4. The `name` key is used for the name of the route on the Sidenav.
  5. The `key` key is used for the key of the route (It will help you with the key prop inside a loop).
  6. The `icon` key is used for the icon of the route on the Sidenav, you have to add a node.
  7. The `collapse` key is used for making a collapsible item on the Sidenav that contains other routes
  inside (nested routes), you need to pass the nested routes inside an array as a value for the `collapse` key.
  8. The `route` key is used to store the route location which is used for the react router.
  9. The `href` key is used to store the external links location.
  10. The `title` key is only for the item with the type of `title` and its used for the title text on the Sidenav.
  10. The `component` key is used to store the component of its route.
*/

// Material Dashboard 3 PRO React layouts
import Analytics from "layouts/dashboards/analytics";
import Sales from "layouts/dashboards/sales";
import ProfileOverview from "layouts/pages/profile/profile-overview";
// import AllProjects from "layouts/pages/profile/all-projects";
import NewUser from "layouts/pages/users/new-user";
import Settings from "layouts/pages/account/settings";
import Billing from "layouts/pages/account/billing";
import Invoice from "layouts/pages/account/invoice";
import Timeline from "layouts/pages/projects/timeline";
import PricingPage from "layouts/pages/pricing-page";
import Widgets from "layouts/pages/widgets";
import RTL from "layouts/pages/rtl";
import Charts from "layouts/pages/charts";
import Notifications from "layouts/pages/notifications";
import Kanban from "layouts/applications/kanban";
import Wizard from "layouts/applications/wizard";
import DataTables from "layouts/applications/data-tables";
import Calendar from "layouts/applications/calendar";
import NewProduct from "layouts/ecommerce/products/new-product";
import EditProduct from "layouts/ecommerce/products/edit-product";
import ProductPage from "layouts/ecommerce/products/product-page";
import OrderList from "layouts/ecommerce/orders/order-list";
import OrderDetails from "layouts/ecommerce/orders/order-details";
import SignInBasic from "layouts/authentication/sign-in/basic";
import SignInCover from "layouts/authentication/sign-in/cover";
import SignInIllustration from "layouts/authentication/sign-in/illustration";
import SignUpCover from "layouts/authentication/sign-up/cover";
import ResetCover from "layouts/authentication/reset-password/cover";

// Material Dashboard 3 PRO React components
import MDAvatar from "components/MDAvatar";

// @mui icons
import Icon from "@mui/material/Icon";

// Images
import profilePicture from "assets/images/team-3.jpg";
import AllScreenings from "layouts/pages/screenings/all-screenings";
import Candidates from "layouts/pages/candidates/all-candidates";
import PricingPlans from "layouts/pages/account/pricing";
import CompanySettings from "layouts/pages/account/settings";

const routes = [
  {
    type: "collapse",
    name: "Brooklyn Alice",
    key: "brooklyn-alice",
    icon: <MDAvatar src={profilePicture} alt="Brooklyn Alice" size="sm" />,
    collapse: [
      {
        name: "My Profile",
        key: "my-profile",
        route: "/profile/profile-overview",
        component: <ProfileOverview />,
      },
      {
        name: "Company Settings",
        key: "settings",
        route: "/account/settings",
        component: <CompanySettings />,
      },
      {
        name: "Logout",
        key: "logout",
        route: "/authentication/sign-in/cover",
        component: <SignInCover />,
      },
    ],
  },
  // { type: "divider", key: "divider-0" },
  // {
  //   type: "collapse",
  //   name: "Dashboards",
  //   key: "dashboards",
  //   icon: <Icon fontSize="small">dashboard</Icon>,
  //   collapse: [
  //     {
  //       name: "Analytics",
  //       key: "analytics",
  //       route: "/dashboards/analytics",
  //       component: <Analytics />,
  //     },
  //     {
  //       name: "Sales",
  //       key: "sales",
  //       route: "/dashboards/sales",
  //       component: <Sales />,
  //     },
  //   ],
  // },
  { type: "title", title: "Pages", key: "title-pages" },
  // {
  //   type: "collapse",
  //   name: "Pages",
  //   key: "pages",
  //   icon: <Icon fontSize="small">image</Icon>,
  //   collapse: [
  //     {
  //       name: "Projects",
  //       key: "projects",
  //       collapse: [
  //         {
  //           name: "Timeline",
  //           key: "timeline",
  //           route: "/pages/projects/timeline",
  //           component: <Timeline />,
  //         },
  //       ],
  //     },
  //     {
  //       name: "Pricing Page",
  //       key: "pricing-page",
  //       route: "/pages/pricing-page",
  //       component: <PricingPage />,
  //     },
  //     { name: "RTL", key: "rtl", route: "/pages/rtl", component: <RTL /> },
  //     {
  //       name: "Widgets",
  //       key: "widgets",
  //       route: "/pages/widgets",
  //       component: <Widgets />,
  //     },
  //     {
  //       name: "Charts",
  //       key: "charts",
  //       route: "/pages/charts",
  //       component: <Charts />,
  //     },
  //     {
  //       name: "Notfications",
  //       key: "notifications",
  //       route: "/pages/notifications",
  //       component: <Notifications />,
  //     },
  //   ],
  // },
  {
    type: "collapse",
    name: "Billing & Payment",
    key: "billing",
    icon: <Icon fontSize="small">person</Icon>,
    collapse: [
      {
        name:"Pricing",
        key:'pricing',
        route:'/account/pricing',
        component: <PricingPlans />
      },
      {
        name: "Billing",
        key: "billing",
        route: "/account/billing",
        component: <Billing />,
      },
      // {
      //   name: "Invoice",
      //   key: "invoice",
      //   route: "/account/invoice",
      //   component: <Invoice />,
      // },
    ],
  },
  // {
  //   type: "collapse",
  //   name: "Screenings",
  //   key: "screenings",
  //   icon: <Icon fontSize="small">people</Icon>,
  //   route: {
  //     name: "All Screenings",
  //     key: "all-screenings",
  //     route: "/pages/screenings/all-screenings",
  //     component: <AllScreenings />,
  //   },
  //   collapse: [
  //     {
  //       name: "All Screenings",
  //       key: "all-screenings",
  //       route: "/pages/screenings/all-screenings",
  //       component: <AllScreenings />,
  //     },
  //     {
  //       name: "New Screening",
  //       key: "new-screening",
  //       route: "/pages/screenings/new-screening",
  //       component: <NewScreening />,
  //     },
  //     {
  //       name: "Screening Detail",
  //       key: "screening-detail",
  //       route: "/pages/screenings/screening/:id",
  //       component: <ScreeningDetail />,
  //       noCollapse: true,
  //     },
  //     {
  //       name: "Screening Report",
  //       key: "screening-report",
  //       route: "/pages/screenings/screening-report/:id",
  //       component: <ScreeningReport />,
  //       noCollapse: true,
  //     },
  //     {
  //       name: "Expired Screening",
  //       key: "expired-screening",
  //       route: "/pages/screenings/expired-screening/:id",
  //       component: <ExpiredScreeningDetail />,
  //       noCollapse: true,
  //     }
  //   ],
  // },
    {
      type: "collapse",
      name: "Screenings",
      key: "screenings",
      icon: <Icon fontSize="small">people</Icon>,
      route: "/screenings/all-screenings",
      component: <AllScreenings />,
      noCollapse:true
  },

  {
    type: "collapse",
    name: "Candidates",
    key: "candidates",
    icon: <Icon fontSize="small">people</Icon>,
    route: "/candidates/all-candidates",
    component: <Candidates />,
    noCollapse: true
  },
];

export default routes;
