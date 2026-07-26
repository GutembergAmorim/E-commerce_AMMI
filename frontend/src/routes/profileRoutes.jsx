import ProtectedRoute from "../components/ProtectedRoute";
import UserProfile from "../pages/Customer/UserProfile";
import PersonalData from "../pages/profile/PersonalData";
import OrderHistory from "../pages/profile/OrderHistory";
import AddressManagement from "../pages/profile/AddressManagement";
import ProfileSettings from "../pages/profile/ProfileSettings";

const profileRoutes = {
  path: "/profile",
  element: (
    <ProtectedRoute>
      <UserProfile />
    </ProtectedRoute>
  ),
  children: [
    {
      index: true,
      element: <PersonalData />,
    },
    {
      path: "orders",
      element: <OrderHistory />,
    },
    {
      path: "addresses",
      element: <AddressManagement />,
    },
    {
      path: "settings",
      element: <ProfileSettings />,
    },
  ],
};

export default profileRoutes;
