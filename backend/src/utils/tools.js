/**
 * Executes code using the public Piston API.
 * @param {string} language - The programming language to execute (e.g., 'javascript', 'python')
 * @param {string} code - The code to execute
 * @returns {Promise<Object>} Execution result containing output or errors
 */
async function executeCode(language, code) {
  try {
    const response = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: language,
        version: '*', // Uses the latest available version
        files: [{ content: code }]
      })
    });

    if (!response.ok) {
      throw new Error(`Execution API returned status ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      stdout: data.run?.stdout || '',
      stderr: data.run?.stderr || '',
      output: data.run?.output || '',
      code: data.run?.code // exit code
    };
  } catch (error) {
    console.error('executeCode tool failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Searches Wikipedia to verify a technical fact or term.
 * @param {string} query - The search term
 * @returns {Promise<Object>} The definition or summary
 */
async function verifyFact(query) {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exsentences=3&exlimit=1&titles=${encodeURIComponent(query)}&explaintext=1&format=json`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Wikipedia API returned status ${response.status}`);
    }

    const data = await response.json();
    const pages = data.query?.pages;
    const pageId = Object.keys(pages)[0];

    if (pageId === '-1') {
      return { found: false, result: `No definition found for "${query}".` };
    }

    return {
      found: true,
      title: pages[pageId].title,
      summary: pages[pageId].extract
    };
  } catch (error) {
    console.error('verifyFact tool failed:', error);
    return {
      found: false,
      error: error.message
    };
  }
}

module.exports = {
  executeCode,
  verifyFact
};
