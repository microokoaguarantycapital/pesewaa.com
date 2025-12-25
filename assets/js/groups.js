'use strict';

// Pesewa.com - Group Management Module

// Group data structure
const GroupData = {
    allGroups: [],
    myGroups: [],
    activeGroup: null,
    groupMembers: {},
    groupLoans: {},
    groupTransactions: {}
};

// Group types
const GroupTypes = {
    BORROWING: 'borrowing',
    LENDING: 'lending',
    MIXED: 'mixed'
};

// Group visibility
const GroupVisibility = {
    PUBLIC: 'public',
    PRIVATE: 'private',
    INVITE_ONLY: 'invite_only'
};

// Initialize groups module
function initGroups() {
    console.log('Groups: Initializing group management module...');
    
    // Load groups data
    loadGroupsData();
    
    // Initialize group UI
    initGroupUI();
    
    // Initialize group event listeners
    initGroupEvents();
    
    // Load user's groups
    loadMyGroups();
}

// Load groups data from localStorage or API
function loadGroupsData() {
    try {
        // Try to load from localStorage first (for demo)
        const savedGroups = localStorage.getItem('pesewa_groups');
        if (savedGroups) {
            const groupsData = JSON.parse(savedGroups);
            GroupData.allGroups = groupsData.allGroups || [];
            GroupData.myGroups = groupsData.myGroups || [];
            GroupData.activeGroup = groupsData.activeGroup || null;
            console.log('Groups: Loaded groups data from localStorage');
        } else {
            // Load default demo groups
            loadDemoGroups();
        }
    } catch (error) {
        console.error('Groups: Error loading groups data:', error);
        loadDemoGroups();
    }
}

// Load demo groups (for initial setup)
function loadDemoGroups() {
    const demoGroups = [
        {
            id: 'group_1',
            name: 'Accra Tech Borrowers',
            type: GroupTypes.BORROWING,
            visibility: GroupVisibility.PUBLIC,
            description: 'Tech professionals in Accra helping each other with short-term loans',
            category: 'technology',
            location: 'Accra, Ghana',
            memberCount: 45,
            maxMembers: 100,
            weeklyLimit: 5000,
            interestRate: 15,
            createdBy: 'admin_1',
            createdAt: '2024-01-01',
            rules: [
                'Must be a tech professional',
                'Minimum 6 months employment',
                'Maximum 2 active loans at a time'
            ]
        },
        {
            id: 'group_2',
            name: 'Kumasi Market Lenders',
            type: GroupTypes.LENDING,
            visibility: GroupVisibility.PRIVATE,
            description: 'Market vendors in Kumasi pooling resources for lending',
            category: 'market_vendors',
            location: 'Kumasi, Ghana',
            memberCount: 28,
            maxMembers: 50,
            weeklyLimit: 20000,
            interestRate: 12,
            createdBy: 'lender_1',
            createdAt: '2024-01-15',
            rules: [
                'Must be a registered market vendor',
                'Minimum ₵1000 weekly contribution',
                'Credit score above 650 required'
            ]
        },
        {
            id: 'group_3',
            name: 'Takoradi Mixed Group',
            type: GroupTypes.MIXED,
            visibility: GroupVisibility.INVITE_ONLY,
            description: 'Mixed group of lenders and borrowers in Takoradi',
            category: 'general',
            location: 'Takoradi, Ghana',
            memberCount: 32,
            maxMembers: 75,
            weeklyLimit: 10000,
            interestRate: 14,
            createdBy: 'user_1',
            createdAt: '2024-02-01',
            rules: [
                'Must be invited by existing member',
                'Active participation required',
                'Monthly meeting attendance'
            ]
        },
        {
            id: 'group_4',
            name: 'Cape Coast Students',
            type: GroupTypes.BORROWING,
            visibility: GroupVisibility.PUBLIC,
            description: 'University students in Cape Coast supporting each other',
            category: 'students',
            location: 'Cape Coast, Ghana',
            memberCount: 67,
            maxMembers: 150,
            weeklyLimit: 2000,
            interestRate: 10,
            createdBy: 'student_1',
            createdAt: '2024-02-15',
            rules: [
                'Must be a registered student',
                'Valid student ID required',
                'Parent/guardian guarantor needed'
            ]
        },
        {
            id: 'group_5',
            name: 'Tamale Farmers Co-op',
            type: GroupTypes.LENDING,
            visibility: GroupVisibility.PRIVATE,
            description: 'Farming cooperative in Tamale providing agricultural loans',
            category: 'agriculture',
            location: 'Tamale, Ghana',
            memberCount: 52,
            maxMembers: 100,
            weeklyLimit: 15000,
            interestRate: 11,
            createdBy: 'farmer_1',
            createdAt: '2024-03-01',
            rules: [
                'Must be a registered farmer',
                'Minimum 1 acre of farmland',
                'Seasonal repayment schedules'
            ]
        }
    ];
    
    GroupData.allGroups = demoGroups;
    console.log('Groups: Loaded demo groups');
}

// Save groups data to localStorage
function saveGroupsData() {
    try {
        const groupsData = {
            allGroups: GroupData.allGroups,
            myGroups: GroupData.myGroups,
            activeGroup: GroupData.activeGroup,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('pesewa_groups', JSON.stringify(groupsData));
        console.log('Groups: Saved groups data');
    } catch (error) {
        console.error('Groups: Error saving groups data:', error);
    }
}

// Initialize group UI
function initGroupUI() {
    // Initialize group tabs
    initGroupTabs();
    
    // Initialize group search
    initGroupSearch();
    
    // Initialize group filters
    initGroupFilters();
    
    // Initialize create group modal
    initCreateGroupModal();
    
    // Initialize group details modal
    initGroupDetailsModal();
}

// Initialize group tabs
function initGroupTabs() {
    const groupTabs = document.querySelectorAll('.group-tab');
    
    groupTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Update active tab
            groupTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding content
            showGroupTab(targetTab);
        });
    });
    
    // Set initial active tab
    const initialTab = document.querySelector('.group-tab.active');
    if (initialTab) {
        const initialTabId = initialTab.getAttribute('data-tab');
        showGroupTab(initialTabId);
    }
}

// Show group tab content
function showGroupTab(tabId) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.group-tab-content');
    tabContents.forEach(content => {
        content.style.display = 'none';
    });
    
    // Show selected tab content
    const targetContent = document.getElementById(`${tabId}Tab`);
    if (targetContent) {
        targetContent.style.display = 'block';
        
        // Load content based on tab
        switch(tabId) {
            case 'explore':
                loadExploreGroups();
                break;
            case 'my':
                loadMyGroupsList();
                break;
            case 'requests':
                loadGroupRequests();
                break;
            case 'create':
                loadCreateGroupForm();
                break;
        }
    }
}

// Initialize group search
function initGroupSearch() {
    const groupSearch = document.getElementById('groupSearch');
    if (groupSearch) {
        groupSearch.addEventListener('input', function() {
            searchGroups(this.value);
        });
        
        // Add debounce for better performance
        groupSearch.addEventListener('input', debounce(function() {
            searchGroups(this.value);
        }, 300));
    }
}

// Initialize group filters
function initGroupFilters() {
    const groupFilters = document.querySelectorAll('.group-filter');
    
    groupFilters.forEach(filter => {
        filter.addEventListener('change', function() {
            applyGroupFilters();
        });
    });
}

// Initialize create group modal
function initCreateGroupModal() {
    const createGroupBtn = document.getElementById('createGroupBtn');
    const createGroupModal = document.getElementById('createGroupModal');
    const closeCreateGroup = document.getElementById('closeCreateGroup');
    
    if (createGroupBtn && createGroupModal) {
        createGroupBtn.addEventListener('click', function() {
            createGroupModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }
    
    if (closeCreateGroup) {
        closeCreateGroup.addEventListener('click', function() {
            createGroupModal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
    
    // Close modal on outside click
    if (createGroupModal) {
        createGroupModal.addEventListener('click', function(e) {
            if (e.target === createGroupModal) {
                createGroupModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
    
    // Create group form submission
    const createGroupForm = document.getElementById('createGroupForm');
    if (createGroupForm) {
        createGroupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleCreateGroup();
        });
    }
}

// Initialize group details modal
function initGroupDetailsModal() {
    // This will be initialized when group cards are created
}

// Initialize group event listeners
function initGroupEvents() {
    // Join group buttons
    document.addEventListener('click', function(e) {
        if (e.target.closest('.join-group-btn')) {
            const button = e.target.closest('.join-group-btn');
            const groupId = button.getAttribute('data-group-id');
            joinGroup(groupId);
        }
        
        // Leave group buttons
        if (e.target.closest('.leave-group-btn')) {
            const button = e.target.closest('.leave-group-btn');
            const groupId = button.getAttribute('data-group-id');
            leaveGroup(groupId);
        }
        
        // View group details buttons
        if (e.target.closest('.view-group-btn')) {
            const button = e.target.closest('.view-group-btn');
            const groupId = button.getAttribute('data-group-id');
            viewGroupDetails(groupId);
        }
        
        // Invite to group buttons
        if (e.target.closest('.invite-to-group-btn')) {
            const button = e.target.closest('.invite-to-group-btn');
            const groupId = button.getAttribute('data-group-id');
            inviteToGroup(groupId);
        }
    });
}

// Load explore groups
function loadExploreGroups() {
    const exploreContainer = document.getElementById('exploreGroupsList');
    if (!exploreContainer) return;
    
    // Filter groups based on user role
    const userRole = window.PesewaAuth ? window.PesewaAuth.getCurrentUserRole() : 'borrower';
    let filteredGroups = [...GroupData.allGroups];
    
    // Show appropriate groups based on role
    if (userRole === 'borrower') {
        filteredGroups = filteredGroups.filter(group => 
            group.type === GroupTypes.BORROWING || group.type === GroupTypes.MIXED
        );
    } else if (userRole === 'lender') {
        filteredGroups = filteredGroups.filter(group => 
            group.type === GroupTypes.LENDING || group.type === GroupTypes.MIXED
        );
    }
    
    // Check if user is already in any groups
    const myGroupIds = GroupData.myGroups.map(g => g.id);
    filteredGroups = filteredGroups.filter(group => !myGroupIds.includes(group.id));
    
    if (filteredGroups.length === 0) {
        exploreContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">👥</div>
                <h3>No Groups Available</h3>
                <p>There are no groups matching your criteria at the moment.</p>
                <button class="btn btn-primary" onclick="showGroupTab('create')">
                    Create a Group
                </button>
            </div>
        `;
        return;
    }
    
    let groupsHTML = '<div class="groups-grid">';
    
    filteredGroups.forEach(group => {
        const isMember = myGroupIds.includes(group.id);
        
        groupsHTML += `
            <div class="group-card ${group.type}">
                <div class="group-header">
                    <div class="group-type-badge ${group.type}">
                        ${group.type.charAt(0).toUpperCase() + group.type.slice(1)}
                    </div>
                    <div class="group-visibility ${group.visibility}">
                        ${group.visibility.replace('_', ' ')}
                    </div>
                </div>
                <div class="group-body">
                    <h3 class="group-name">${group.name}</h3>
                    <p class="group-description">${group.description}</p>
                    
                    <div class="group-details">
                        <div class="group-detail">
                            <span class="detail-label">📍</span>
                            <span class="detail-value">${group.location}</span>
                        </div>
                        <div class="group-detail">
                            <span class="detail-label">👥</span>
                            <span class="detail-value">${group.memberCount}/${group.maxMembers} members</span>
                        </div>
                        <div class="group-detail">
                            <span class="detail-label">💰</span>
                            <span class="detail-value">₵${group.weeklyLimit.toLocaleString()} weekly limit</span>
                        </div>
                        <div class="group-detail">
                            <span class="detail-label">📊</span>
                            <span class="detail-value">${group.interestRate}% interest</span>
                        </div>
                    </div>
                    
                    <div class="group-rules">
                        <strong>Rules:</strong>
                        <ul>
                            ${group.rules.slice(0, 2).map(rule => `<li>${rule}</li>`).join('')}
                            ${group.rules.length > 2 ? '<li>...</li>' : ''}
                        </ul>
                    </div>
                </div>
                <div class="group-footer">
                    <button class="btn btn-outline-secondary view-group-btn" data-group-id="${group.id}">
                        View Details
                    </button>
                    ${!isMember ? `
                        <button class="btn btn-primary join-group-btn" data-group-id="${group.id}">
                            Join Group
                        </button>
                    ` : `
                        <button class="btn btn-success" disabled>
                            Already Member
                        </button>
                    `}
                </div>
            </div>
        `;
    });
    
    groupsHTML += '</div>';
    exploreContainer.innerHTML = groupsHTML;
}

// Load my groups list
function loadMyGroupsList() {
    const myGroupsContainer = document.getElementById('myGroupsList');
    if (!myGroupsContainer) return;
    
    if (GroupData.myGroups.length === 0) {
        myGroupsContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">👥</div>
                <h3>No Groups Joined</h3>
                <p>You haven't joined any groups yet. Explore groups to find ones that match your needs.</p>
                <button class="btn btn-primary" onclick="showGroupTab('explore')">
                    Explore Groups
                </button>
            </div>
        `;
        return;
    }
    
    let groupsHTML = '<div class="groups-grid">';
    
    GroupData.myGroups.forEach(group => {
        groupsHTML += `
            <div class="group-card ${group.type} member">
                <div class="group-header">
                    <div class="group-type-badge ${group.type}">
                        ${group.type.charAt(0).toUpperCase() + group.type.slice(1)}
                    </div>
                    <div class="group-visibility ${group.visibility}">
                        ${group.visibility.replace('_', ' ')}
                    </div>
                </div>
                <div class="group-body">
                    <h3 class="group-name">${group.name}</h3>
                    <p class="group-description">${group.description}</p>
                    
                    <div class="group-stats">
                        <div class="stat">
                            <span class="stat-value">${group.memberCount}</span>
                            <span class="stat-label">Members</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">₵${group.weeklyLimit.toLocaleString()}</span>
                            <span class="stat-label">Weekly Limit</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${group.interestRate}%</span>
                            <span class="stat-label">Interest</span>
                        </div>
                    </div>
                    
                    <div class="group-actions">
                        ${group.type === GroupTypes.BORROWING ? `
                            <button class="btn btn-sm btn-outline-primary" onclick="requestGroupLoan('${group.id}')">
                                Request Loan
                            </button>
                        ` : ''}
                        ${group.type === GroupTypes.LENDING ? `
                            <button class="btn btn-sm btn-outline-success" onclick="viewGroupLoans('${group.id}')">
                                View Loans
                            </button>
                        ` : ''}
                        <button class="btn btn-sm btn-outline-info view-group-btn" data-group-id="${group.id}">
                            View Details
                        </button>
                    </div>
                </div>
                <div class="group-footer">
                    <button class="btn btn-danger btn-sm leave-group-btn" data-group-id="${group.id}">
                        Leave Group
                    </button>
                    <button class="btn btn-secondary btn-sm invite-to-group-btn" data-group-id="${group.id}">
                        Invite Friends
                    </button>
                </div>
            </div>
        `;
    });
    
    groupsHTML += '</div>';
    myGroupsContainer.innerHTML = groupsHTML;
}

// Load group requests
function loadGroupRequests() {
    const requestsContainer = document.getElementById('groupRequestsList');
    if (!requestsContainer) return;
    
    // In a real app, this would fetch from API
    const demoRequests = [
        {
            id: 'request_1',
            groupId: 'group_1',
            groupName: 'Accra Tech Borrowers',
            userId: 'user_123',
            userName: 'Kwame Mensah',
            userRole: 'Software Developer',
            requestedAt: '2024-01-10',
            status: 'pending'
        },
        {
            id: 'request_2',
            groupId: 'group_2',
            groupName: 'Kumasi Market Lenders',
            userId: 'user_456',
            userName: 'Ama Serwaa',
            userRole: 'Market Vendor',
            requestedAt: '2024-01-12',
            status: 'pending'
        }
    ];
    
    if (demoRequests.length === 0) {
        requestsContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📨</div>
                <h3>No Pending Requests</h3>
                <p>You don't have any pending group requests at the moment.</p>
            </div>
        `;
        return;
    }
    
    let requestsHTML = '<div class="requests-list">';
    
    demoRequests.forEach(request => {
        requestsHTML += `
            <div class="request-card ${request.status}">
                <div class="request-header">
                    <h4>${request.groupName}</h4>
                    <span class="request-status badge badge-${request.status}">
                        ${request.status}
                    </span>
                </div>
                <div class="request-body">
                    <div class="requestor-info">
                        <div class="requestor-name">${request.userName}</div>
                        <div class="requestor-role">${request.userRole}</div>
                    </div>
                    <div class="request-meta">
                        <span class="meta-item">
                            <span class="meta-label">Requested:</span>
                            <span class="meta-value">${formatDate(request.requestedAt)}</span>
                        </span>
                    </div>
                </div>
                <div class="request-footer">
                    ${request.status === 'pending' ? `
                        <button class="btn btn-success btn-sm" onclick="approveGroupRequest('${request.id}')">
                            Approve
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="rejectGroupRequest('${request.id}')">
                            Reject
                        </button>
                    ` : ''}
                    <button class="btn btn-outline-secondary btn-sm" onclick="viewRequestorProfile('${request.userId}')">
                        View Profile
                    </button>
                </div>
            </div>
        `;
    });
    
    requestsHTML += '</div>';
    requestsContainer.innerHTML = requestsHTML;
}

// Load create group form
function loadCreateGroupForm() {
    const createGroupForm = document.getElementById('createGroupForm');
    if (!createGroupForm) return;
    
    // Set default values based on user role
    const userRole = window.PesewaAuth ? window.PesewaAuth.getCurrentUserRole() : 'borrower';
    const groupTypeSelect = document.getElementById('groupType');
    
    if (groupTypeSelect) {
        if (userRole === 'borrower') {
            groupTypeSelect.value = GroupTypes.BORROWING;
        } else if (userRole === 'lender') {
            groupTypeSelect.value = GroupTypes.LENDING;
        }
        
        // Update visibility options based on type
        updateVisibilityOptions(groupTypeSelect.value);
        
        // Add event listener for type change
        groupTypeSelect.addEventListener('change', function() {
            updateVisibilityOptions(this.value);
            updateGroupRules(this.value);
        });
    }
    
    // Initialize group rules
    const groupType = groupTypeSelect ? groupTypeSelect.value : GroupTypes.BORROWING;
    updateGroupRules(groupType);
}

// Update visibility options based on group type
function updateVisibilityOptions(groupType) {
    const visibilitySelect = document.getElementById('groupVisibility');
    if (!visibilitySelect) return;
    
    // Clear existing options
    visibilitySelect.innerHTML = '';
    
    // Add options based on group type
    const options = [
        { value: GroupVisibility.PUBLIC, label: 'Public - Anyone can join' },
        { value: GroupVisibility.PRIVATE, label: 'Private - Approval required' }
    ];
    
    if (groupType === GroupTypes.LENDING || groupType === GroupTypes.MIXED) {
        options.push({ value: GroupVisibility.INVITE_ONLY, label: 'Invite Only - By invitation only' });
    }
    
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.label;
        visibilitySelect.appendChild(optionElement);
    });
}

// Update group rules based on type
function updateGroupRules(groupType) {
    const rulesContainer = document.getElementById('groupRulesContainer');
    if (!rulesContainer) return;
    
    let rulesHTML = '';
    
    switch(groupType) {
        case GroupTypes.BORROWING:
            rulesHTML = `
                <div class="form-group">
                    <label>Maximum Active Loans per Member</label>
                    <input type="number" class="form-control" name="maxActiveLoans" min="1" max="5" value="3">
                </div>
                <div class="form-group">
                    <label>Minimum Employment Duration (months)</label>
                    <input type="number" class="form-control" name="minEmployment" min="0" value="6">
                </div>
                <div class="form-group">
                    <label>Required Guarantors</label>
                    <input type="number" class="form-control" name="requiredGuarantors" min="0" max="3" value="1">
                </div>
            `;
            break;
            
        case GroupTypes.LENDING:
            rulesHTML = `
                <div class="form-group">
                    <label>Minimum Weekly Contribution (₵)</label>
                    <input type="number" class="form-control" name="minContribution" min="100" value="1000">
                </div>
                <div class="form-group">
                    <label>Minimum Credit Score</label>
                    <input type="number" class="form-control" name="minCreditScore" min="300" max="850" value="650">
                </div>
                <div class="form-group">
                    <label>Maximum Default Rate (%)</label>
                    <input type="number" class="form-control" name="maxDefaultRate" min="0" max="100" value="5">
                </div>
            `;
            break;
            
        case GroupTypes.MIXED:
            rulesHTML = `
                <div class="form-group">
                    <label>Meeting Frequency</label>
                    <select class="form-control" name="meetingFrequency">
                        <option value="weekly">Weekly</option>
                        <option value="biweekly" selected>Bi-weekly</option>
                        <option value="monthly">Monthly</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Minimum Participation (%)</label>
                    <input type="number" class="form-control" name="minParticipation" min="0" max="100" value="80">
                </div>
                <div class="form-group">
                    <label>Maximum Members</label>
                    <input type="number" class="form-control" name="maxMembers" min="10" max="500" value="100">
                </div>
            `;
            break;
    }
    
    rulesContainer.innerHTML = rulesHTML;
}

// Search groups
function searchGroups(query) {
    if (!query.trim()) {
        loadExploreGroups();
        return;
    }
    
    const searchTerm = query.toLowerCase();
    const filteredGroups = GroupData.allGroups.filter(group => 
        group.name.toLowerCase().includes(searchTerm) ||
        group.description.toLowerCase().includes(searchTerm) ||
        group.location.toLowerCase().includes(searchTerm) ||
        group.category.toLowerCase().includes(searchTerm)
    );
    
    displaySearchResults(filteredGroups);
}

// Display search results
function displaySearchResults(groups) {
    const exploreContainer = document.getElementById('exploreGroupsList');
    if (!exploreContainer) return;
    
    if (groups.length === 0) {
        exploreContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔍</div>
                <h3>No Groups Found</h3>
                <p>No groups match your search criteria. Try different keywords.</p>
            </div>
        `;
        return;
    }
    
    // Show search results
    let groupsHTML = '<div class="groups-grid">';
    
    groups.forEach(group => {
        groupsHTML += `
            <div class="group-card ${group.type}">
                <div class="group-header">
                    <div class="group-type-badge ${group.type}">
                        ${group.type.charAt(0).toUpperCase() + group.type.slice(1)}
                    </div>
                    <div class="group-visibility ${group.visibility}">
                        ${group.visibility.replace('_', ' ')}
                    </div>
                </div>
                <div class="group-body">
                    <h3 class="group-name">${group.name}</h3>
                    <p class="group-description">${group.description}</p>
                    <div class="group-location">📍 ${group.location}</div>
                </div>
                <div class="group-footer">
                    <button class="btn btn-outline-secondary view-group-btn" data-group-id="${group.id}">
                        View Details
                    </button>
                    <button class="btn btn-primary join-group-btn" data-group-id="${group.id}">
                        Join Group
                    </button>
                </div>
            </div>
        `;
    });
    
    groupsHTML += '</div>';
    exploreContainer.innerHTML = groupsHTML;
}

// Apply group filters
function applyGroupFilters() {
    const typeFilter = document.getElementById('filterType');
    const locationFilter = document.getElementById('filterLocation');
    const categoryFilter = document.getElementById('filterCategory');
    
    let filteredGroups = [...GroupData.allGroups];
    
    if (typeFilter && typeFilter.value !== 'all') {
        filteredGroups = filteredGroups.filter(group => group.type === typeFilter.value);
    }
    
    if (locationFilter && locationFilter.value !== 'all') {
        filteredGroups = filteredGroups.filter(group => group.location.includes(locationFilter.value));
    }
    
    if (categoryFilter && categoryFilter.value !== 'all') {
        filteredGroups = filteredGroups.filter(group => group.category === categoryFilter.value);
    }
    
    displayFilteredGroups(filteredGroups);
}

// Display filtered groups
function displayFilteredGroups(groups) {
    const exploreContainer = document.getElementById('exploreGroupsList');
    if (!exploreContainer) return;
    
    if (groups.length === 0) {
        exploreContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔍</div>
                <h3>No Groups Found</h3>
                <p>No groups match your filter criteria. Try adjusting your filters.</p>
            </div>
        `;
        return;
    }
    
    loadExploreGroups(); // Reload with filtered view
}

// Join a group
function joinGroup(groupId) {
    const group = GroupData.allGroups.find(g => g.id === groupId);
    if (!group) {
        showToast('Group not found', 'error');
        return;
    }
    
    // Check if already a member
    if (GroupData.myGroups.some(g => g.id === groupId)) {
        showToast('You are already a member of this group', 'info');
        return;
    }
    
    // Check group capacity
    if (group.memberCount >= group.maxMembers) {
        showToast('This group is full', 'error');
        return;
    }
    
    // Check group visibility
    if (group.visibility === GroupVisibility.INVITE_ONLY) {
        showToast('This group is invite only. You need an invitation to join.', 'warning');
        return;
    }
    
    if (group.visibility === GroupVisibility.PRIVATE) {
        // Send join request
        sendJoinRequest(groupId);
        return;
    }
    
    // For public groups, join directly
    simulateAPI('/api/groups/join', { groupId })
        .then(response => {
            if (response.success) {
                // Add to my groups
                GroupData.myGroups.push(group);
                group.memberCount++;
                
                // Save data
                saveGroupsData();
                
                // Update UI
                loadExploreGroups();
                loadMyGroupsList();
                
                showToast(`Successfully joined ${group.name}`, 'success');
            } else {
                showToast('Failed to join group', 'error');
            }
        })
        .catch(error => {
            console.error('Groups: Error joining group:', error);
            showToast('Error joining group', 'error');
        });
}

// Send join request for private groups
function sendJoinRequest(groupId) {
    const group = GroupData.allGroups.find(g => g.id === groupId);
    
    simulateAPI('/api/groups/request-join', { groupId })
        .then(response => {
            if (response.success) {
                showToast(`Join request sent to ${group.name}. Waiting for approval.`, 'success');
            } else {
                showToast('Failed to send join request', 'error');
            }
        })
        .catch(error => {
            console.error('Groups: Error sending join request:', error);
            showToast('Error sending join request', 'error');
        });
}

// Leave a group
function leaveGroup(groupId) {
    const group = GroupData.allGroups.find(g => g.id === groupId);
    if (!group) {
        showToast('Group not found', 'error');
        return;
    }
    
    if (!confirm(`Are you sure you want to leave ${group.name}?`)) {
        return;
    }
    
    simulateAPI('/api/groups/leave', { groupId })
        .then(response => {
            if (response.success) {
                // Remove from my groups
                GroupData.myGroups = GroupData.myGroups.filter(g => g.id !== groupId);
                group.memberCount = Math.max(0, group.memberCount - 1);
                
                // Clear active group if leaving it
                if (GroupData.activeGroup && GroupData.activeGroup.id === groupId) {
                    GroupData.activeGroup = null;
                }
                
                // Save data
                saveGroupsData();
                
                // Update UI
                loadMyGroupsList();
                loadExploreGroups();
                
                showToast(`Left ${group.name}`, 'success');
            } else {
                showToast('Failed to leave group', 'error');
            }
        })
        .catch(error => {
            console.error('Groups: Error leaving group:', error);
            showToast('Error leaving group', 'error');
        });
}

// View group details
function viewGroupDetails(groupId) {
    const group = GroupData.allGroups.find(g => g.id === groupId);
    if (!group) {
        showToast('Group not found', 'error');
        return;
    }
    
    // Check if already a member
    const isMember = GroupData.myGroups.some(g => g.id === groupId);
    
    // Create modal content
    const modalContent = `
        <div class="group-details-modal">
            <div class="modal-header">
                <h2>${group.name}</h2>
                <button class="close-modal" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="group-basic-info">
                    <div class="info-row">
                        <span class="info-label">Type:</span>
                        <span class="info-value badge ${group.type}">
                            ${group.type.charAt(0).toUpperCase() + group.type.slice(1)}
                        </span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Visibility:</span>
                        <span class="info-value badge ${group.visibility}">
                            ${group.visibility.replace('_', ' ')}
                        </span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Location:</span>
                        <span class="info-value">${group.location}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Category:</span>
                        <span class="info-value">${group.category}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Members:</span>
                        <span class="info-value">${group.memberCount}/${group.maxMembers}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Weekly Limit:</span>
                        <span class="info-value">₵${group.weeklyLimit.toLocaleString()}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Interest Rate:</span>
                        <span class="info-value">${group.interestRate}%</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Created:</span>
                        <span class="info-value">${formatDate(group.createdAt)}</span>
                    </div>
                </div>
                
                <div class="group-description-section">
                    <h3>Description</h3>
                    <p>${group.description}</p>
                </div>
                
                <div class="group-rules-section">
                    <h3>Group Rules</h3>
                    <ul>
                        ${group.rules.map(rule => `<li>${rule}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="group-members-section">
                    <h3>Members (${group.memberCount})</h3>
                    <div class="members-list">
                        ${generateMembersList(groupId)}
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                ${isMember ? `
                    <button class="btn btn-danger" onclick="leaveGroup('${groupId}')">
                        Leave Group
                    </button>
                    <button class="btn btn-secondary" onclick="inviteToGroup('${groupId}')">
                        Invite Friends
                    </button>
                ` : `
                    <button class="btn btn-primary" onclick="joinGroup('${groupId}')">
                        Join Group
                    </button>
                `}
                <button class="btn btn-outline-secondary" onclick="closeModal()">
                    Close
                </button>
            </div>
        </div>
    `;
    
    // Show modal
    showModal('Group Details', modalContent);
}

// Generate members list for group
function generateMembersList(groupId) {
    // In a real app, this would fetch from API
    const demoMembers = [
        { id: 'user_1', name: 'Kwame Mensah', role: 'Group Admin', joined: '2024-01-01' },
        { id: 'user_2', name: 'Ama Serwaa', role: 'Member', joined: '2024-01-05' },
        { id: 'user_3', name: 'Kofi Asante', role: 'Member', joined: '2024-01-10' }
    ];
    
    return demoMembers.map(member => `
        <div class="member-item">
            <div class="member-avatar">${getInitials(member.name)}</div>
            <div class="member-info">
                <div class="member-name">${member.name}</div>
                <div class="member-role">${member.role}</div>
                <div class="member-joined">Joined ${formatDate(member.joined)}</div>
            </div>
        </div>
    `).join('');
}

// Invite to group
function inviteToGroup(groupId) {
    const group = GroupData.allGroups.find(g => g.id === groupId);
    if (!group) {
        showToast('Group not found', 'error');
        return;
    }
    
    // Show invite modal
    const inviteModalContent = `
        <div class="invite-modal">
            <h3>Invite to ${group.name}</h3>
            <p>Share this invitation link or enter phone numbers/emails:</p>
            
            <div class="invite-link">
                <input type="text" class="form-control" value="${window.location.origin}/groups/join/${groupId}" readonly>
                <button class="btn btn-sm btn-secondary" onclick="copyInviteLink()">Copy</button>
            </div>
            
            <div class="invite-contacts">
                <textarea class="form-control" placeholder="Enter phone numbers or emails (comma separated)" rows="3"></textarea>
                <button class="btn btn-primary btn-block mt-2" onclick="sendInvitations('${groupId}')">
                    Send Invitations
                </button>
            </div>
        </div>
    `;
    
    showModal('Invite to Group', inviteModalContent);
}

// Handle create group
function handleCreateGroup() {
    const form = document.getElementById('createGroupForm');
    if (!form) return;
    
    const formData = new FormData(form);
    const groupData = {
        id: 'group_' + Math.random().toString(36).substr(2, 9),
        name: formData.get('groupName'),
        type: formData.get('groupType'),
        visibility: formData.get('groupVisibility'),
        description: formData.get('groupDescription'),
        category: formData.get('groupCategory'),
        location: formData.get('groupLocation'),
        memberCount: 1,
        maxMembers: parseInt(formData.get('maxMembers')) || 100,
        weeklyLimit: parseInt(formData.get('weeklyLimit')) || 5000,
        interestRate: parseInt(formData.get('interestRate')) || 15,
        createdBy: 'current_user',
        createdAt: new Date().toISOString().split('T')[0],
        rules: []
    };
    
    // Add rules based on type
    switch(groupData.type) {
        case GroupTypes.BORROWING:
            groupData.rules = [
                `Maximum ${formData.get('maxActiveLoans') || 3} active loans per member`,
                `Minimum ${formData.get('minEmployment') || 6} months employment`,
                `${formData.get('requiredGuarantors') || 1} guarantor(s) required`
            ];
            break;
        case GroupTypes.LENDING:
            groupData.rules = [
                `Minimum weekly contribution: ₵${parseInt(formData.get('minContribution') || 1000).toLocaleString()}`,
                `Minimum credit score: ${formData.get('minCreditScore') || 650}`,
                `Maximum default rate: ${formData.get('maxDefaultRate') || 5}%`
            ];
            break;
        case GroupTypes.MIXED:
            groupData.rules = [
                `${formData.get('meetingFrequency') || 'biweekly'} meetings required`,
                `Minimum ${formData.get('minParticipation') || 80}% participation`,
                `Maximum ${formData.get('maxMembers') || 100} members`
            ];
            break;
    }
    
    // Validate group data
    const validationErrors = validateGroupData(groupData);
    if (validationErrors.length > 0) {
        showToast(validationErrors.join(', '), 'error');
        return;
    }
    
    // Simulate API call
    simulateAPI('/api/groups/create', groupData)
        .then(response => {
            if (response.success) {
                // Add to all groups and my groups
                GroupData.allGroups.push(groupData);
                GroupData.myGroups.push(groupData);
                GroupData.activeGroup = groupData;
                
                // Save data
                saveGroupsData();
                
                // Close modal
                const createGroupModal = document.getElementById('createGroupModal');
                if (createGroupModal) {
                    createGroupModal.classList.remove('active');
                    document.body.style.overflow = '';
                }
                
                // Update UI
                loadMyGroupsList();
                showGroupTab('my');
                
                showToast(`Group "${groupData.name}" created successfully!`, 'success');
            } else {
                showToast('Failed to create group', 'error');
            }
        })
        .catch(error => {
            console.error('Groups: Error creating group:', error);
            showToast('Error creating group', 'error');
        });
}

// Validate group data
function validateGroupData(groupData) {
    const errors = [];
    
    if (!groupData.name || groupData.name.length < 3) {
        errors.push('Group name must be at least 3 characters');
    }
    
    if (!groupData.description || groupData.description.length < 10) {
        errors.push('Description must be at least 10 characters');
    }
    
    if (!groupData.location) {
        errors.push('Location is required');
    }
    
    if (groupData.weeklyLimit < 100) {
        errors.push('Weekly limit must be at least ₵100');
    }
    
    if (groupData.interestRate < 5 || groupData.interestRate > 30) {
        errors.push('Interest rate must be between 5% and 30%');
    }
    
    return errors;
}

// Request group loan
function requestGroupLoan(groupId) {
    // Implementation would be in borrowing.js
    console.log('Requesting loan from group:', groupId);
    showToast('Loan request functionality coming soon', 'info');
}

// View group loans
function viewGroupLoans(groupId) {
    // Implementation would be in lending.js
    console.log('Viewing loans for group:', groupId);
    showToast('Group loans view coming soon', 'info');
}

// Approve group request
function approveGroupRequest(requestId) {
    simulateAPI('/api/groups/approve-request', { requestId })
        .then(response => {
            if (response.success) {
                showToast('Request approved successfully', 'success');
                loadGroupRequests();
            } else {
                showToast('Failed to approve request', 'error');
            }
        })
        .catch(error => {
            console.error('Groups: Error approving request:', error);
            showToast('Error approving request', 'error');
        });
}

// Reject group request
function rejectGroupRequest(requestId) {
    simulateAPI('/api/groups/reject-request', { requestId })
        .then(response => {
            if (response.success) {
                showToast('Request rejected', 'success');
                loadGroupRequests();
            } else {
                showToast('Failed to reject request', 'error');
            }
        })
        .catch(error => {
            console.error('Groups: Error rejecting request:', error);
            showToast('Error rejecting request', 'error');
        });
}

// View requestor profile
function viewRequestorProfile(userId) {
    // Implementation would show user profile
    console.log('Viewing profile for user:', userId);
    showToast('Profile view coming soon', 'info');
}

// Copy invite link
function copyInviteLink() {
    const inviteInput = document.querySelector('.invite-link input');
    if (inviteInput) {
        inviteInput.select();
        document.execCommand('copy');
        showToast('Invite link copied to clipboard', 'success');
    }
}

// Send invitations
function sendInvitations(groupId) {
    const textarea = document.querySelector('.invite-contacts textarea');
    if (!textarea || !textarea.value.trim()) {
        showToast('Please enter contacts to invite', 'warning');
        return;
    }
    
    const contacts = textarea.value.split(',').map(c => c.trim()).filter(c => c);
    
    simulateAPI('/api/groups/send-invitations', { groupId, contacts })
        .then(response => {
            if (response.success) {
                showToast(`Invitations sent to ${contacts.length} contact(s)`, 'success');
                closeModal();
            } else {
                showToast('Failed to send invitations', 'error');
            }
        })
        .catch(error => {
            console.error('Groups: Error sending invitations:', error);
            showToast('Error sending invitations', 'error');
        });
}

// Show modal
function showModal(title, content) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('dynamicModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'dynamicModal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${title}</h2>
                <button class="close-modal" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    const modal = document.getElementById('dynamicModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Get initials from name
function getInitials(name) {
    if (!name) return '??';
    return name.split(' ').map(part => part.charAt(0)).join('').toUpperCase().substring(0, 2);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Simulate API call
function simulateAPI(endpoint, data) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (Math.random() > 0.1) {
                resolve({
                    success: true,
                    message: 'Operation successful',
                    data: data
                });
            } else {
                reject({
                    success: false,
                    message: 'Server error. Please try again.'
                });
            }
        }, 1000);
    });
}

// Show toast notification
function showToast(message, type = 'info') {
    if (window.PesewaAuth && window.PesewaAuth.showToast) {
        window.PesewaAuth.showToast(message, type);
    } else if (window.PesewaApp && window.PesewaApp.showToast) {
        window.PesewaApp.showToast(message, type);
    } else {
        alert(`${type.toUpperCase()}: ${message}`);
    }
}

// Initialize groups module when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initGroups();
});

// Export for use in other modules
window.PesewaGroups = {
    initGroups,
    loadExploreGroups,
    loadMyGroupsList,
    joinGroup,
    leaveGroup,
    viewGroupDetails,
    createGroup: handleCreateGroup,
    searchGroups,
    applyGroupFilters
};