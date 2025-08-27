import React from 'react';
// import '../styles/layout/_accueilpage.scss'

const Pagination = ({ currentPage, totalPages, nextPage, prevPage }) => {
  return (
    <div className='pagination'>
      <button onClick={prevPage} disabled={currentPage === 1}>
        &#60; 
      </button>
      <span className='pageInfo'>{currentPage} / {totalPages}</span>
      <button onClick={nextPage} disabled={currentPage === totalPages}>
        &#62;
      </button>
    </div>
  );
};

export default Pagination;