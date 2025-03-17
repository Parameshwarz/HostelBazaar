import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import Browse from './pages/Browse';
import { Messages } from './pages/Messages';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ItemDetails from './pages/ItemDetails';
import Profile from './pages/Profile';
import NewItem from './pages/NewItem';
import MerchPage from './pages/Merch';
import MerchDetail from './pages/MerchDetail';
import ServicesPage from './pages/Services';
import ServiceDetails from './pages/ServiceDetails';
import ServiceOffer from './pages/ServiceOffer';
import PostProject from './pages/PostProject';
import ProjectDetails from './pages/ProjectDetails';
import ServicesDashboard from './pages/ServicesDashboard';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import Trade from './pages/Trade';
import Requests from './pages/Requests';
import BrowseMerch from './pages/BrowseMerch';
import StyleFeedPage from './pages/StyleFeed';
import Matches from './pages/Matches';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/browse', element: <Browse /> },
      { path: '/messages', element: <Messages /> },
      { path: '/messages/:chatId', element: <Messages /> },
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
      { path: '/items/:id', element: <ItemDetails /> },
      { path: '/profile', element: <Profile /> },
      { path: '/items/new', element: <NewItem /> },
      { path: '/merch', element: <MerchPage /> },
      { path: '/browse-merch', element: <BrowseMerch /> },
      { path: '/merch/:id', element: <MerchDetail /> },
      { path: '/services', element: <ServicesPage /> },
      { path: '/services/offer', element: <ServiceOffer /> },
      { path: '/services/:id', element: <ServiceDetails /> },
      { path: '/services/post-project', element: <PostProject /> },
      { path: '/projects/:id', element: <ProjectDetails /> },
      { path: '/services/dashboard', element: <ServicesDashboard /> },
      { path: '/orders', element: <Orders /> },
      { path: '/orders/:id', element: <OrderDetails /> },
      { path: '/matches', element: <Matches /> },
      { path: '/trade', element: <Trade /> },
      { path: '/requests', element: <Requests /> },
      { path: '/style-feed', element: <StyleFeedPage /> },
      { path: '*', element: <Navigate to="/" replace /> }
    ]
  }
], {
  basename: '/HostelBazaar',
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
}); 