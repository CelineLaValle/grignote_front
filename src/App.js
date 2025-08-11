import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import Header from "./components/Header";
import Login from './components/Login';
import MyAccount from './components/MyAccount';
import Menu from './components/Menu';
import Accueil from "./pages/Accueil";
import ArticleDetails from './components/ArticleDetails';
import AddArticle from "./components/AddArticle";
// import EditArticle from './components/EditArticle';
import Footer from "./components/Footer";

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/MyAccount" element={<MyAccount />} />
        <Route path="/Menu" element={<Menu />} />
        <Route path="/article/:id" element={<ArticleDetails />} />
        <Route path="/AddArticle" element={<AddArticle />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;





// <Route path="/edit/:id" element={<EditArticle />} />