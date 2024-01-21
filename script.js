document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('getRepositoriesBtn').addEventListener('click', function (event) {
    event.preventDefault();
    getRepositories();
  });
});

let currentPage = 1;
const repositoriesPerPage = 10;

function getRepositories() {
  const usernameInput = document.getElementById('usernameInput');
  const username = usernameInput.value;

  if (!username) {
    alert('Please enter a GitHub username.');
    return;
  }

  const userApiUrl = `https://api.github.com/users/${username}`;

  // Fetch user data
  fetch(userApiUrl)
    .then(response => response.json())
    .then(userData => {
      // Fetch all repositories
      fetchAllRepositories(username)
        .then(repositories => {
          const newWindow = window.open('', '_blank', 'fullscreen=yes');

          newWindow.document.write(`
            <html lang="en">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${username}'s GitHub Repositories</title>
                <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
                <link rel="stylesheet" href="styles.css">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
                <style>
                  #pagination {
                    text-align: center;
                    margin-top: 20px;
                  }
                  .pagination-box {
                    display: inline-block;
                    margin: 0 0px;
                    padding: 5px 10px;
                    border: 1px solid #ccc;
                    background-color: #fff;
                  }
                  .pagination-buttons {
                    margin-top: 10px;
                    text-align: center;
                  }
                  .pagination-buttons button {
                    background-color: white;
                    border: 1px solid #ccc;
                    color: #007bff;
                    padding: 5px 10px;
                    margin: 0 5px;
                    cursor: pointer;
                    transition: background-color 0.3s, color 0.3s, font-size 0.3s;
                  }
                  .pagination-buttons button:hover {
                    background-color: #007bff;
                    color: white;
                    font-size: 14px;
                  }
                  .pagination-box.active {
                    background-color: #007bff;
                    color: white;
                    font-size: 14px;
                  }

                </style>
              </head>
              <body>
                <div class="container mt-5">
                  <div class="row">
                    <div class="col-md-4 text-center">
                      <img src="" alt="Profile Picture" id="profilePic" class="img-fluid rounded-circle">
                    </div>
                    <div class="col-md-8">
                      <h4 id="username">GitHub Username</h4>
                      <div id="userOverview" class="text-left"></div>
                    </div>
                  </div>
                  <p><a href="https://github.com/${username}" target="_blank" style="color: black"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-link" viewBox="0 0 16 16">
                      <path d="M6.354 5.5H4a3 3 0 0 0 0 6h3a3 3 0 0 0 2.83-4H9q-.13 0-.25.031A2 2 0 0 1 7 10.5H4a2 2 0 1 1 0-4h1.535c.218-.376.495-.714.82-1z"/>
                      <path d="M9 5.5a3 3 0 0 0-2.83 4h1.098A2 2 0 0 1 9 6.5h3a2 2 0 1 1 0-4h-1.535a4 4 0 0 1-.82 1H12a3 3 0 1 0 0-6z"/>
                    </svg> https://github.com/${username}</a></p>
                  <div class="row mt-3">
                    <div class="row">
                      <div class="col-md-6" id="repositoriesColumn1"></div>
                      <div class="col-md-6" id="repositoriesColumn2"></div>
                    </div>
                  </div>
                  <div id="pagination" class="mt-3"></div>
                  <div class="pagination-buttons">
                    <button id="olderButton" class="btn btn-secondary"><i class="fa fa-long-arrow-left"></i>Older</button>
                    <button id="newerButton" class="btn btn-secondary">Newer<i class="fa fa-long-arrow-right"></i></button>
                  </div>
                </div>
                <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
                <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.0.8/dist/umd/popper.min.js"></script>
                <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
                <script src="script.js"></script>
              </body>
            </html>
          `);

          newWindow.document.getElementById('profilePic').src = 'loading.gif';
          newWindow.document.getElementById('username').innerText = 'Loading...';
          newWindow.document.getElementById('userOverview').innerHTML = 'Loading...';

          displayUserProfile(userData, newWindow.document.getElementById('profilePic'), newWindow.document.getElementById('username'), newWindow.document.getElementById('userOverview'));
          displayRepositoriesWithPagination(repositories, newWindow.document.getElementById('repositoriesColumn1'), newWindow.document.getElementById('repositoriesColumn2'), newWindow.document.getElementById('pagination'), newWindow.document.getElementById('newerButton'), newWindow.document.getElementById('olderButton'));
        })
        .catch(error => {
          console.error('Error fetching repositories:', error);
        });
    })
    .catch(error => {
      console.error('Error fetching user data:', error);
    });
}

function fetchAllRepositories(username) {
  const repositoriesPerPage = 100;
  let allRepositories = [];
  let page = 1;

  const fetchPage = async () => {
    const apiUrl = `https://api.github.com/users/${username}/repos?per_page=${repositoriesPerPage}&page=${page}`;
    const response = await fetch(apiUrl);

    if (response.ok) {
      const repositories = await response.json();
      if (repositories.length > 0) {
        allRepositories = allRepositories.concat(repositories);
        page++;
        await fetchPage(); // Fetch the next page
      }
    } else {
      throw new Error(`Error fetching repositories. Status code: ${response.status}`);
    }
  };

  return fetchPage().then(() => allRepositories);
}



function displayUserProfile(userData, profilePicElement, usernameElement, userOverviewElement) {
  const avatarUrl = userData.avatar_url;

  if (avatarUrl) {
    profilePicElement.src = avatarUrl;
    profilePicElement.alt = 'Profile Picture';
  } else {
    profilePicElement.src = ''; 
  }

  usernameElement.innerText = userData.login || 'GitHub Username';
  userOverviewElement.innerHTML = `
    <p> ${userData.bio || 'Not available'}</p>
    <p><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-geo-alt-fill" viewBox="0 0 16 16">
      <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"/>
    </svg> ${userData.location || 'Not available'}</p>

    <p><strong>Followers:</strong> ${userData.followers || 0}</p>

   
  `;
}

function displayRepositoriesWithPagination(repositories, column1, column2, paginationElement, newerButton, olderButton) {
  const totalRepositories = repositories.length;
  const totalPages = Math.ceil(totalRepositories / repositoriesPerPage);

  if (totalRepositories === 0) {
    column1.innerHTML = '<p>No repositories found.</p>';
    return;
  }

  renderPaginationControls(totalPages, paginationElement);


  displayRepositories(repositories, column1, column2);


  paginationElement.addEventListener('click', function (event) {
    if (event.target.tagName === 'A') {
      currentPage = parseInt(event.target.dataset.page);
      renderPaginationControls(totalPages, paginationElement);
      displayRepositories(repositories, column1, column2);
    }
  });
  

  

newerButton.addEventListener('click', function () {
  if (currentPage < totalPages) {
    currentPage++;
    renderPaginationControls(totalPages, paginationElement);
    displayRepositories(repositories, column1, column2);
  }
});

olderButton.addEventListener('click', function () {
  if (currentPage > 1) {
    currentPage--;
    renderPaginationControls(totalPages, paginationElement);
    displayRepositories(repositories, column1, column2);
  }
});

}

function displayRepositories(repositories, column1, column2) {
  const startIndex = (currentPage - 1) * repositoriesPerPage;
  const endIndex = startIndex + repositoriesPerPage;
  const currentRepositories = repositories.slice(startIndex, endIndex);

  column1.innerHTML = '';
  column2.innerHTML = '';

  currentRepositories.forEach((repo, index) => {
    const repoCard = `
      <div class="card mb-3">
        <div class="card-body">
          <h5 class="card-title"><span style="color: #3582C4;">${repo.name}</span></h5>
          <p class="card-text">${repo.description || 'No description available.'}</p>
          <p class="card-text"><small class="text-muted"><span style="background-color:  #3582C4; color: white; padding: 2px 5px; border-radius: 3px;">${repo.language || 'Not specified'}</span></small></p>
        </div>
      </div>
    `;

    index % 2 === 0 ? column1.innerHTML += repoCard : column2.innerHTML += repoCard;
  });
}
function renderPaginationControls(totalPages, paginationElement) {
  paginationElement.innerHTML = '';

  const maxPagesToShow = 20;

  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(startPage + maxPagesToShow - 1, totalPages);

  if (endPage - startPage < maxPagesToShow - 1) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  if (startPage > 1) {
    const prevPagesLink = document.createElement('a');
    prevPagesLink.href = '#';
    prevPagesLink.innerText = '«';
    prevPagesLink.dataset.page = startPage - 1;
    prevPagesLink.classList.add('pagination-box');
    paginationElement.appendChild(prevPagesLink);
  }

  for (let i = startPage; i <= endPage; i++) {
    const pageLink = document.createElement('a');
    pageLink.href = '#';
    pageLink.innerText = i;
    pageLink.dataset.page = i;
    pageLink.classList.add('pagination-box');

    if (i === currentPage) {
      pageLink.classList.add('active');
    }

    paginationElement.appendChild(pageLink);
  }

  if (endPage < totalPages) {
    const nextPagesLink = document.createElement('a');
    nextPagesLink.href = '#';
    nextPagesLink.innerText = '»';
    nextPagesLink.dataset.page = endPage + 1;
    nextPagesLink.classList.add('pagination-box');
    paginationElement.appendChild(nextPagesLink);
  }
  
  if (currentPage > maxPagesToShow) {
    const backToFirstLink = document.createElement('a');
    backToFirstLink.href = '#';
    backToFirstLink.innerText = '« 1';
    backToFirstLink.dataset.page = 1;
    backToFirstLink.classList.add('pagination-box');
    paginationElement.insertBefore(backToFirstLink, paginationElement.firstChild);
  }
}


