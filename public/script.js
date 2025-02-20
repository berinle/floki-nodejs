// Fetch PostgreSQL version from the backend API
fetch('/api/version')
  .then((response) => response.json())
  .then((data) => {
    const versionElement = document.getElementById('version');
    if (data.version) {
      versionElement.textContent = `PostgreSQL Server Version: ${data.version}`;
    } else {
      versionElement.textContent = 'Failed to fetch PostgreSQL version.';
    }
  })
  .catch((error) => {
    console.error('Error fetching version:', error);
    document.getElementById('version').textContent = 'Error fetching version.';
  });
