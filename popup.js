document.addEventListener('DOMContentLoaded', function() {
  // Load saved tabs when popup opens
  loadSavedTabs();

  // Save current tab
  document.getElementById('saveCurrentTab').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    saveTab(tab);
    chrome.tabs.remove(tab.id);
  });

  // Save all tabs
  document.getElementById('saveAllTabs').addEventListener('click', async () => {
    try {
      const tabs = await chrome.tabs.query({currentWindow: true});
      if (tabs.length === 0) return;

      // Get current saved tabs
      let savedTabs = await chrome.storage.local.get('tabs');
      savedTabs = savedTabs.tabs ? savedTabs : { tabs: [] };
      
      // Create a group ID for this batch
      const groupId = Date.now();
      
      // Save all tabs first
      for (const tab of tabs) {
        const newTab = {
          id: Date.now() + Math.random(),
          url: tab.url,
          title: tab.title,
          favicon: tab.favIconUrl,
          timestamp: new Date().toISOString(),
          groupId: groupId, // Add groupId to track related tabs
          groupSize: tabs.length // Add group size for display
        };
        savedTabs.tabs.push(newTab);
      }
      
      await chrome.storage.local.set(savedTabs);
      const tabIds = tabs.map(tab => tab.id);
      await chrome.tabs.remove(tabIds);
      loadSavedTabs();
    } catch (error) {
      console.error('Error saving tabs:', error);
      alert('Error saving tabs. Please try again.');
    }
  });

  // Add clear all functionality
  document.getElementById('clearAllTabs').addEventListener('click', async () => {
    if (confirm('Are you sure you want to clear all saved tabs?')) {
      await chrome.storage.local.set({ tabs: [] });
      loadSavedTabs();
    }
  });
});

async function saveTab(tab) {
  try {
    const savedTabs = await chrome.storage.local.get('tabs');
    const newTab = {
      id: Date.now() + Math.random(), // Ensure unique ID
      url: tab.url,
      title: tab.title,
      favicon: tab.favIconUrl,
      timestamp: new Date().toISOString()
    };
    
    const tabs = savedTabs.tabs || [];
    tabs.push(newTab);
    await chrome.storage.local.set({ tabs });
    loadSavedTabs();
  } catch (error) {
    console.error('Error saving tab:', error);
    alert('Error saving tab. Please try again.');
  }
}

async function loadSavedTabs() {
  const savedTabs = await chrome.storage.local.get('tabs');
  const container = document.getElementById('savedTabs');
  container.innerHTML = '';

  if (savedTabs.tabs && savedTabs.tabs.length > 0) {
    // Group tabs by groupId
    const groups = {};
    savedTabs.tabs.reverse().forEach(tab => {
      if (tab.groupId) {
        if (!groups[tab.groupId]) {
          groups[tab.groupId] = [];
        }
        groups[tab.groupId].push(tab);
      } else {
        // Single tabs get their own group
        groups[tab.id] = [tab];
      }
    });

    // Create elements for each group
    Object.values(groups).forEach(groupTabs => {
      if (groupTabs.length > 1) {
        // Create group container
        const groupElement = document.createElement('div');
        groupElement.className = 'tab-group';
        
        // Add group header
        const groupHeader = document.createElement('div');
        groupHeader.className = 'group-header';
        groupHeader.innerHTML = `
          <span>Group (${groupTabs.length} tabs)</span>
          <div class="group-actions">
            <button class="button button-restore-all" title="Restore all tabs in group">
              Restore All
            </button>
            <button class="button button-delete" title="Remove group">×</button>
          </div>
        `;
        
        // Add restore all handler
        groupHeader.querySelector('.button-restore-all').addEventListener('click', () => {
          groupTabs.forEach(tab => restoreTab(tab.id, tab.url));
        });
        
        // Add delete group handler
        groupHeader.querySelector('.button-delete').addEventListener('click', () => {
          if (confirm('Remove all tabs in this group?')) {
            groupTabs.forEach(tab => removeTab(tab.id));
          }
        });
        
        groupElement.appendChild(groupHeader);
        
        // Add individual tabs
        groupTabs.forEach(tab => {
          groupElement.appendChild(createTabElement(tab));
        });
        
        container.appendChild(groupElement);
      } else {
        // Single tab, no group
        container.appendChild(createTabElement(groupTabs[0]));
      }
    });
  } else {
    container.innerHTML = '<p>No saved tabs</p>';
  }
}

// Helper function to create tab element
function createTabElement(tab) {
  const tabElement = document.createElement('div');
  tabElement.className = 'tab-item';
  
  const titleSpan = document.createElement('span');
  titleSpan.className = 'tab-title';
  titleSpan.textContent = tab.title;
  
  const buttonsContainer = document.createElement('div');
  buttonsContainer.className = 'button-container';
  
  const restoreButton = document.createElement('button');
  restoreButton.className = 'button button-restore';
  restoreButton.textContent = 'Restore';
  restoreButton.addEventListener('click', () => restoreTab(tab.id, tab.url));
  
  const deleteButton = document.createElement('button');
  deleteButton.className = 'button button-delete';
  deleteButton.textContent = '×';
  deleteButton.title = 'Remove from saved tabs';
  deleteButton.addEventListener('click', () => removeTab(tab.id));
  
  buttonsContainer.appendChild(restoreButton);
  buttonsContainer.appendChild(deleteButton);
  tabElement.appendChild(titleSpan);
  tabElement.appendChild(buttonsContainer);
  
  return tabElement;
}

// Helper function to escape HTML
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Add new function to remove individual tab
async function removeTab(id) {
  const savedTabs = await chrome.storage.local.get('tabs');
  savedTabs.tabs = savedTabs.tabs.filter(tab => tab.id !== id); // Remove parseInt
  await chrome.storage.local.set(savedTabs);
  loadSavedTabs();
}

async function restoreTab(id, url) {
  try {
    // Create new tab
    await chrome.tabs.create({ url: url });
    
    // Remove from storage
    const savedTabs = await chrome.storage.local.get('tabs');
    savedTabs.tabs = savedTabs.tabs.filter(tab => tab.id !== id); // Remove parseInt
    await chrome.storage.local.set(savedTabs);
    
    // Refresh the display
    loadSavedTabs();
  } catch (error) {
    console.error('Error restoring tab:', error);
    alert('Error restoring tab. Please check the URL is valid.');
  }
} 