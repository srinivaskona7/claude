document.addEventListener('DOMContentLoaded', () => {
      const form = document.getElementById('prompt-form');
      const promptInput = document.getElementById('prompt');
      const output = document.getElementById('output');
      const modelSelect = document.getElementById('model');
      const streamCheckbox = document.getElementById('stream');
  
      // Initialize Highlight.js
      hljs.highlightAll();
  
      form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const prompt = promptInput.value.trim();
          if (!prompt) return;
  
          output.innerHTML = '<p>Generating...</p>';
          const options = { model: modelSelect.value, stream: streamCheckbox.checked };
  
          try {
              if (options.stream) {
                  const response = await puter.ai.chat(prompt, options);
                  let fullText = '';
                  // Check if response is iterable and has content
                  if (!response) {
                      output.innerHTML = `<p>No response received. Please try again.</p>`;
                      return;
                  }
                  for await (const part of response) {
                      fullText += part?.text || '';
                      renderOutput(fullText);
                  }
                  if (!fullText) {
                      output.innerHTML = `<p>No content generated for this prompt.</p>`;
                  }
              } else {
                  const response = await puter.ai.chat(prompt, options);
                  // Check if the response exists before rendering
                  if (response && response.text) {
                      renderOutput(response.text);
                  } else {
                      output.innerHTML = `<p>No content generated for this prompt.</p>`;
                  }
              }
          } catch (error) {
              output.innerHTML = `<p>Error: ${error.message}</p>`;
          }
      });
  
      function renderOutput(text) {
          // Parse markdown to HTML
          const html = marked.parse(text, { gfm: true, breaks: true });
  
          // Clear and set output
          output.innerHTML = html;
  
          // Handle code blocks: segregate into cards
          output.querySelectorAll('pre code').forEach((block, index) => {
              // Get the language or filename (basic)
              const lang = block.className.split('-')[1] || 'Code';
  
              // Create card and header
              const card = document.createElement('div');
              card.className = 'code-file-card';
              const header = document.createElement('div');
              header.className = 'code-file-header';
              header.innerHTML = `<span>File ${index + 1}: ${lang}</span>`;
  
              // Add the copy button
              const copyBtn = document.createElement('button');
              copyBtn.className = 'copy-btn';
              copyBtn.textContent = 'Copy';
              copyBtn.title = 'Copy to clipboard';
              copyBtn.onclick = () => {
                  navigator.clipboard.writeText(block.textContent);
                  copyBtn.textContent = 'Copied!';
                  setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
              };
              header.appendChild(copyBtn);
  
              // Clone the original <pre> (contains <code>) to avoid DOM circular error
              const preClone = block.parentNode.cloneNode(true);
  
              // Highlight the cloned code
              hljs.highlightElement(preClone.querySelector('code'));
  
              // Assemble card
              card.appendChild(header);
              card.appendChild(preClone);
  
              // Replace the original <pre> with the card
              const originalPre = block.parentNode;
              originalPre.parentNode.replaceChild(card, originalPre);
          });
  
          // Handle images: styling is already in CSS
      }
  });
