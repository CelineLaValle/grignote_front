import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import { FilterProvider } from './components/FilterContext';
import Header from './components/Header';
import Register from './components/Register';
import Verify from './components/Verify';
import Login from './components/Login';
import AdminPage from './components/AdminPage';
import MyAccount from './components/MyAccount';
import MyFavorites from './components/MyFavorites';
import Menu from './components/Menu';
import Accueil from './pages/Accueil';
import ArticleDetails from './components/ArticleDetails';
import AddArticle from './components/AddArticle';
import EditArticle from './components/EditArticle';
import EditUser from './components/EditUser';
import NotFound from './components/NotFound';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';

function App() {
  return (
    <FilterProvider>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path='/' element={<Accueil />} />
          <Route path='/Register' element={<Register />} />
          <Route path='/Verify' element={<Verify />} />
          <Route path='/Login' element={<Login />} />
          <Route path='/AdminPage' element={<AdminPage />} />
          <Route path='/MyAccount' element={<MyAccount />} />
          <Route path='/MyFavorites' element={<MyFavorites />} />
          <Route path='/Menu' element={<Menu />} />
          <Route path='/article/:idArticle' element={<ArticleDetails />} />
          <Route path='/AddArticle' element={<AddArticle />} />
          <Route path='/EditArticle/:id' element={<EditArticle />} />
          <Route path='/EditUser/:id' element={<EditUser />} />
          <Route path='/About' element={<About />} />
          <Route path='/Contact' element={<Contact />} />
          <Route path='*' element={<NotFound />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </FilterProvider>
  );
}

export default App;





// <Route path='/edit/:id' element={<EditArticle />} />