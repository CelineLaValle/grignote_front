const Pagination = ({ currentPage, totalPages, nextPage, prevPage }) => {
  return (
    <section className='pagination'>
      <button onClick={prevPage} disabled={currentPage === 1}>
        &#60; 
      </button>
      <span className='pageInfo'>{currentPage} / {totalPages}</span>
      <button onClick={nextPage} disabled={currentPage === totalPages}>
        &#62;
      </button>
    </section>
  );
};

export default Pagination;