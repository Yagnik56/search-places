// params: { countryIds: "IN", namePrefix: "del", limit: "5" }

const options = {
  method: "GET",
  headers: {
    "X-RapidAPI-Key": "4ac5e3352fmshe6ac515ca3b8ccap1f0045jsnf0a504a87bbe",
    "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com",
  },
};

let APILimit = 3;
let offset = 0;

let currPage = 1;
let totalPage;

const searchField = document.querySelector(".search-field");
const searchBtn = document.querySelector(".search-btn");

const resultTableContainer = document.querySelector(".result-table-container");
const paginationContainer = document.querySelector(".pagination-container");
const pageInfo = document.querySelector(".page-info");
const paginationResultContainer = document.querySelector(".pagination-result-container");
const prevPageBtn = document.querySelector(".prev-page-btn");
const nextPageBtn = document.querySelector(".next-page-btn");

const limitInput = document.querySelector("#limit-input");
const limitInputError = document.querySelector(".limit-input-error");

const showSearchResult = function (emptySearch, resultData) {
  if (emptySearch) {
    resultTableContainer.innerHTML = "<p>Start searching..</p>";
    paginationContainer.style.display = "none";
    return;
  }

  if (resultData.error) {
    resultTableContainer.innerHTML = `<p>${resultData.error}</p>`;
    paginationContainer.style.display = "none";
    return;
  }

  if (resultData.data?.length === 0) {
    resultTableContainer.innerHTML = `<p>No results found</p>`;
    paginationContainer.style.display = "none";
    return;
  }

  let resultRows = "";
  if (!resultData.data) {
    resultTableContainer.innerHTML = `<p>Something went wrong</p>`;
    paginationContainer.style.display = "none";
    return;
  }

  resultData.data.forEach((element, index) => {
    resultRows += `
    <tr>
      <td>${index + 1}</td>
      <td>${element.name}</td>
      <td>
      <img src=https://www.countryflagsapi.com/png/${element.countryCode.toLowerCase()} />
      ${element.country}
      </td>
    </tr>
    `;
  });

  resultTableContainer.innerHTML = `
  <table>
    <tr>
      <th>#</th>
      <th>Place name</th>
      <th>Country</th>
    </tr>
    ${resultRows}
  </table>
  `;

  paginationContainer.style.display = "flex";

  totalPage = Math.ceil(+resultData.metadata.totalCount / APILimit);

  if (currPage === 1 && totalPage === 1) {
    prevPageBtn.style.display = "none";
    nextPageBtn.style.display = "none";
  } else if (currPage === 1) {
    prevPageBtn.style.display = "none";
    nextPageBtn.style.display = "block";
  } else if (currPage === totalPage) {
    nextPageBtn.style.display = "none";
    prevPageBtn.style.display = "block";
  } else {
    prevPageBtn.style.display = "block";
    nextPageBtn.style.display = "block";
  }

  pageInfo.innerHTML = `
  <p>Page ${currPage} of ${totalPage}</p>
  `;
};

const onLimitChange = async function () {
  const limit = limitInput.value;
  if (limit < 3 || limit > 10) {
    limitInputError.innerHTML = "<p>Limit value must be between 5 and 10</p>";
    limitInputError.style.display = "block";
    limitInput.value = limit < 3 ? 3 : 10;
    if(APILimit===limitInput.value){
      return;
    }else{
      APILimit=limitInput.value;
      searchFunc();
      return;
    }
  }
  limitInputError.style.display = "none";
  APILimit = limit;
  offset = 0;
  currPage = 1;
  searchFunc();
};

const onChangePage = async function (e) {
  const page = e.target.classList;
  if (page.contains("prev-page-btn")) {
    currPage -= 1;
    if (currPage <= 0) {
      currPage = 0;
    }
    offset = (currPage - 1) * APILimit;
  }

  if (page.contains("next-page-btn")) {
    currPage += 1;
    if (currPage > totalPage) {
      currPage = totalPage;
    }
    offset = (currPage - 1) * APILimit;
  }

  await searchFunc();
};

const searchFunc = async function () {
  const searchValue = searchField.value;

  if (!searchValue) {
    showSearchResult(true);
    return;
  }

  const searchUrl = `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${searchValue}&limit=${APILimit}&offset=${offset}`;

  try {
    resultTableContainer.innerHTML = `<div class="loading-bar"><p>Loading...</p><p class="loader"></p></div> `;
    let response = await fetch(searchUrl, options);
    response = await response.json();
    showSearchResult(false, response);
  } catch (error) {
    showSearchResult(false, { error: error.message });
  }
};

const clearResults = function () {
  resultTableContainer.innerHTML = "";
  paginationContainer.style.display = "none";
};

const searchOnKeyPress = async function (e) {
  if (e.key === "Enter") {
    await searchFunc();
  }
};

const searchInputFieldFocus = function (e) {
  if (e.ctrlKey && e.key === "/") {
    searchField.focus();
  }
};

searchBtn.addEventListener("click", searchFunc);
limitInput.addEventListener("change", onLimitChange);
paginationResultContainer.addEventListener("click", onChangePage);
searchField.addEventListener("input", clearResults);
searchField.addEventListener("keypress", searchOnKeyPress);
document.body.addEventListener("keydown", searchInputFieldFocus);
