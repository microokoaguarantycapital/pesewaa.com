'use strict';

/**
 * Pesewa.com - Groups Module
 * Handles group creation, management, and member operations
 */

const PesewaGroups = {
    // Groups data
    groups: [],
    userGroups: [],

    // Group limits
    limits: {
        maxMembers: 1000,
        minMembers: 5,
        maxGroupsPerUser: 4,
        maxBorrowersPerLender: Infinity // No limit for now
    },

    // Initialize groups module
    init() {
        console.log('Pesewa Groups Initializing...');
        
        // Load groups data
        this.loadGroupsData();
        
        // Load user's groups
        this.loadUserGroups();
        
        // Setup group creation form
        this.setupGroupCreation();
        
        // Setup group joining
        this.setupGroupJoining();
        
        // Setup group management
        this.setupGroupManagement();
        
        // Setup group search and filters
        this.setupGroupSearch();
        
        console.log('Pesewa Groups Initialized');
    },

    // Load groups data from storage/API
    async loadGroupsData() {
        try {
            // Try to load from localStorage first
            const storedGroups = localStorage.getItem('pesewa_groups');
            if (storedGroups) {
                this.groups = JSON.parse(storedGroups);
            } else {
                // Load from data file
                const response = await fetch('data/demo-groups.json');
                this.groups = await response.json();
                localStorage.setItem('pesewa_groups', JSON.stringify(this.groups));
            }
        } catch (error) {
            console.error('Error loading groups data:', error);
            // Create sample groups
            this.groups = this.createSampleGroups();
            localStorage.setItem('pesewa_groups', JSON.stringify(this.groups));
        }
    },

    // Load user's groups
    loadUserGroups() {
        const user = this.getCurrentUser();
        if (!user) {
            this.userGroups = [];
            return;
        }
        
        // Get user's groups from groups data
        this.userGroups = this.groups.filter(group => 
            group.members.some(member => member.id === user.id)
        );
        
        // Store in localStorage for quick access
        localStorage.setItem(`pesewa_user_${user.id}_groups`, JSON.stringify(this.userGroups));
    },

    // Setup group creation form
    setupGroupCreation() {
        const createForm = document.getElementById('createGroupForm');
        if (!createForm) return;

        createForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleGroupCreation(createForm);
        });
        
        // Setup country selection
        const countrySelect = document.getElementById('groupCountry');
        if (countrySelect) {
            this.populateCountryOptions(countrySelect);
        }
    },

    // Setup group joining
    setupGroupJoining() {
        const joinForms = document.querySelectorAll('[data-action="join-group"]');
        
        joinForms.forEach(form => {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const groupId = form.getAttribute('data-group-id');
                await this.handleGroupJoin(groupId, form);
            });
        });
        
        // Setup referral joining
        const referralForm = document.getElementById('joinByReferralForm');
        if (referralForm) {
            referralForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleReferralJoin(referralForm);
            });
        }
    },

    // Setup group management
    setupGroupManagement() {
        // Setup member management
        this.setupMemberManagement();
        
        // Setup group settings
        this.setupGroupSettings();
        
        // Setup group invitations
        this.setupGroupInvitations();
    },

    // Setup group search and filters
    setupGroupSearch() {
        const searchInput = document.getElementById('groupSearch');
        const countryFilter = document.getElementById('groupCountryFilter');
        const typeFilter = document.getElementById('groupTypeFilter');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterGroups(e.target.value, countryFilter?.value, typeFilter?.value);
            });
        }
        
        if (countryFilter) {
            this.populateCountryOptions(countryFilter);
            countryFilter.addEventListener('change', (e) => {
                this.filterGroups(searchInput?.value, e.target.value, typeFilter?.value);
            });
        }
        
        if (typeFilter) {
            typeFilter.addEventListener('change', (e) => {
                this.filterGroups(searchInput?.value, countryFilter?.value, e.target.value);
            });
        }
    },

    // Handle group creation
    async handleGroupCreation(form) {
        try {
            // Show loading state
            this.showGroupLoading(true, 'Creating group...');
            
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            // Validate group data
            const validation = this.validateGroupData(data);
            if (!validation.valid) {
                throw new Error(validation.errors.join(', '));
            }
            
            // Create group object
            const group = this.createGroupObject(data);
            
            // Save group
            await this.saveGroup(group);
            
            // Add creator as admin member
            await this.addMemberToGroup(group.id, this.getCurrentUser().id, 'admin');
            
            // Update user's groups
            this.userGroups.push(group);
            
            // Show success
            this.showGroupSuccess(`Group "${group.name}" created successfully!`);
            
            // Redirect to group page
            setTimeout(() => {
                window.location.href = `group-details.html?id=${group.id}`;
            }, 1500);
            
        } catch (error) {
            this.showGroupError(error.message || 'Failed to create group');
        } finally {
            this.showGroupLoading(false);
        }
    },

    // Handle group joining
    async handleGroupJoin(groupId, form = null) {
        try {
            const user = this.getCurrentUser();
            if (!user) {
                throw new Error('Please login to join a group');
            }
            
            // Check if user can join more groups
            if (!this.canJoinMoreGroups(user.id)) {
                throw new Error(`You can only join ${this.limits.maxGroupsPerUser} groups maximum`);
            }
            
            // Get group
            const group = this.groups.find(g => g.id === groupId);
            if (!group) {
                throw new Error('Group not found');
            }
            
            // Check if group has space
            if (group.members.length >= this.limits.maxMembers) {
                throw new Error('This group is full (maximum 1000 members)');
            }
            
            // Check if already a member
            if (group.members.some(m => m.id === user.id)) {
                throw new Error('You are already a member of this group');
            }
            
            // For referral groups, check referral code
            if (group.joinType === 'referral' && form) {
                const referralCode = new FormData(form).get('referralCode');
                if (!referralCode || !this.validateReferralCode(referralCode, group)) {
                    throw new Error('Invalid referral code');
                }
            }
            
            // Check user's reputation
            if (!this.hasGoodReputation(user.id)) {
                throw new Error('Your reputation score is too low to join this group');
            }
            
            // Add user to group
            await this.addMemberToGroup(groupId, user.id, 'member');
            
            // Update user's groups
            this.userGroups.push(group);
            
            // Show success
            this.showGroupSuccess(`You have joined "${group.name}" successfully!`);
            
            // Refresh group display
            this.displayUserGroups();
            
        } catch (error) {
            this.showGroupError(error.message || 'Failed to join group');
        }
    },

    // Handle referral-based joining
    async handleReferralJoin(form) {
        try {
            const formData = new FormData(form);
            const referralCode = formData.get('referralCode');
            const referrerPhone = formData.get('referrerPhone');
            
            if (!referralCode && !referrerPhone) {
                throw new Error('Please provide either a referral code or referrer phone number');
            }
            
            // Find group by referral code or referrer
            let group = null;
            
            if (referralCode) {
                group = this.groups.find(g => g.referralCode === referralCode);
            } else if (referrerPhone) {
                group = this.groups.find(g => 
                    g.members.some(m => m.phone === referrerPhone && m.role === 'admin')
                );
            }
            
            if (!group) {
                throw new Error('Invalid referral. Please check the code or contact your referrer.');
            }
            
            // Join the group
            await this.handleGroupJoin(group.id);
            
        } catch (error) {
            this.showGroupError(error.message);
        }
    },

    // Setup member management
    setupMemberManagement() {
        // Member approval (for group admins)
        const approveButtons = document.querySelectorAll('[data-action="approve-member"]');
        approveButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                const memberId = button.getAttribute('data-member-id');
                const groupId = button.getAttribute('data-group-id');
                await this.approveMember(groupId, memberId);
            });
        });
        
        // Member removal
        const removeButtons = document.querySelectorAll('[data-action="remove-member"]');
        removeButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                const memberId = button.getAttribute('data-member-id');
                const groupId = button.getAttribute('data-group-id');
                await this.removeMember(groupId, memberId);
            });
        });
        
        // Member role change
        const roleSelects = document.querySelectorAll('[data-action="change-member-role"]');
        roleSelects.forEach(select => {
            select.addEventListener('change', async (e) => {
                const memberId = select.getAttribute('data-member-id');
                const groupId = select.getAttribute('data-group-id');
                const newRole = e.target.value;
                await this.changeMemberRole(groupId, memberId, newRole);
            });
        });
    },

    // Setup group settings
    setupGroupSettings() {
        const settingsForm = document.getElementById('groupSettingsForm');
        if (!settingsForm) return;
        
        settingsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.updateGroupSettings(settingsForm);
        });
    },

    // Setup group invitations
    setupGroupInvitations() {
        const inviteForm = document.getElementById('inviteMemberForm');
        if (!inviteForm) return;
        
        inviteForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.inviteMember(inviteForm);
        });
    },

    // Validate group creation data
    validateGroupData(data) {
        const errors = [];
        
        // Required fields
        if (!data.groupName || data.groupName.trim().length < 3) {
            errors.push('Group name must be at least 3 characters');
        }
        
        if (!data.groupCountry) {
            errors.push('Country is required');
        }
        
        if (!data.groupType) {
            errors.push('Group type is required');
        }
        
        if (!data.joinType) {
            errors.push('Join method is required');
        }
        
        // Description validation
        if (!data.groupDescription || data.groupDescription.trim().length < 10) {
            errors.push('Description must be at least 10 characters');
        }
        
        // Category validation
        if (!data.categories || (Array.isArray(data.categories) && data.categories.length === 0)) {
            errors.push('Please select at least one loan category');
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    },

    // Create group object
    createGroupObject(data) {
        const user = this.getCurrentUser();
        
        return {
            id: 'group_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            name: data.groupName,
            description: data.groupDescription,
            country: data.groupCountry,
            type: data.groupType,
            joinType: data.joinType,
            categories: Array.isArray(data.categories) ? data.categories : [data.categories],
            createdBy: user?.id || 'unknown',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            members: [],
            lenders: [],
            borrowers: [],
            totalLoans: 0,
            totalLent: 0,
            repaymentRate: 100,
            isActive: true,
            referralCode: this.generateReferralCode(),
            settings: {
                allowCrossGroup: data.allowCrossGroup === 'on',
                requireGuarantors: data.requireGuarantors === 'on',
                minRating: parseInt(data.minRating) || 3,
                maxLoanAmount: parseInt(data.maxLoanAmount) || 1500
            }
        };
    },

    // Save group to storage
    async saveGroup(group) {
        // Add to groups array
        this.groups.push(group);
        
        // Save to localStorage
        localStorage.setItem('pesewa_groups', JSON.stringify(this.groups));
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return group;
    },

    // Add member to group
    async addMemberToGroup(groupId, userId, role = 'member') {
        const group = this.groups.find(g => g.id === groupId);
        const user = this.getUserById(userId);
        
        if (!group || !user) {
            throw new Error('Group or user not found');
        }
        
        // Check if already a member
        if (group.members.some(m => m.id === userId)) {
            throw new Error('User is already a member');
        }
        
        // Add member
        group.members.push({
            id: userId,
            name: user.name,
            phone: user.phone,
            role: role,
            joinedAt: new Date().toISOString(),
            status: 'active'
        });
        
        // Update group stats
        if (user.type === 'lender' || user.type === 'both') {
            group.lenders.push(userId);
        }
        if (user.type === 'borrower' || user.type === 'both') {
            group.borrowers.push(userId);
        }
        
        group.updatedAt = new Date().toISOString();
        
        // Save updated groups
        localStorage.setItem('pesewa_groups', JSON.stringify(this.groups));
        
        // Update user's groups
        this.loadUserGroups();
        
        return { success: true, group };
    },

    // Approve member (for pending members)
    async approveMember(groupId, memberId) {
        const group = this.groups.find(g => g.id === groupId);
        if (!group) return;
        
        const member = group.members.find(m => m.id === memberId);
        if (member) {
            member.status = 'active';
            group.updatedAt = new Date().toISOString();
            
            // Save changes
            localStorage.setItem('pesewa_groups', JSON.stringify(this.groups));
            
            // Show success
            this.showGroupSuccess('Member approved successfully');
            
            // Refresh display
            this.displayGroupMembers(groupId);
        }
    },

    // Remove member from group
    async removeMember(groupId, memberId) {
        const group = this.groups.find(g => g.id === groupId);
        if (!group) return;
        
        // Check if user is group admin
        const user = this.getCurrentUser();
        const isAdmin = group.members.some(m => 
            m.id === user?.id && m.role === 'admin'
        );
        
        if (!isAdmin && memberId !== user?.id) {
            throw new Error('Only group admins can remove members');
        }
        
        // Remove member
        group.members = group.members.filter(m => m.id !== memberId);
        
        // Update lender/borrower lists
        const memberUser = this.getUserById(memberId);
        if (memberUser) {
            if (memberUser.type === 'lender' || memberUser.type === 'both') {
                group.lenders = group.lenders.filter(id => id !== memberId);
            }
            if (memberUser.type === 'borrower' || memberUser.type === 'both') {
                group.borrowers = group.borrowers.filter(id => id !== memberId);
            }
        }
        
        group.updatedAt = new Date().toISOString();
        
        // Save changes
        localStorage.setItem('pesewa_groups', JSON.stringify(this.groups));
        
        // Update user's groups if they removed themselves
        if (memberId === user?.id) {
            this.userGroups = this.userGroups.filter(g => g.id !== groupId);
        }
        
        // Show success
        this.showGroupSuccess('Member removed successfully');
        
        // Refresh display
        if (memberId === user?.id) {
            // Redirect to groups page if user left group
            window.location.href = 'groups.html';
        } else {
            this.displayGroupMembers(groupId);
        }
    },

    // Change member role
    async changeMemberRole(groupId, memberId, newRole) {
        const group = this.groups.find(g => g.id === groupId);
        if (!group) return;
        
        const member = group.members.find(m => m.id === memberId);
        if (member) {
            member.role = newRole;
            group.updatedAt = new Date().toISOString();
            
            // Save changes
            localStorage.setItem('pesewa_groups', JSON.stringify(this.groups));
            
            // Show success
            this.showGroupSuccess(`Member role changed to ${newRole}`);
        }
    },

    // Update group settings
    async updateGroupSettings(form) {
        try {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            const groupId = form.getAttribute('data-group-id');
            
            const group = this.groups.find(g => g.id === groupId);
            if (!group) {
                throw new Error('Group not found');
            }
            
            // Check if user is admin
            const user = this.getCurrentUser();
            const isAdmin = group.members.some(m => 
                m.id === user?.id && m.role === 'admin'
            );
            
            if (!isAdmin) {
                throw new Error('Only group admins can update settings');
            }
            
            // Update settings
            group.settings = {
                allowCrossGroup: data.allowCrossGroup === 'on',
                requireGuarantors: data.requireGuarantors === 'on',
                minRating: parseInt(data.minRating) || 3,
                maxLoanAmount: parseInt(data.maxLoanAmount) || 1500,
                requireReferrals: data.requireReferrals === 'on',
                autoApprove: data.autoApprove === 'on'
            };
            
            group.updatedAt = new Date().toISOString();
            
            // Save changes
            localStorage.setItem('pesewa_groups', JSON.stringify(this.groups));
            
            // Show success
            this.showGroupSuccess('Group settings updated successfully');
            
        } catch (error) {
            this.showGroupError(error.message);
        }
    },

    // Invite member to group
    async inviteMember(form) {
        try {
            const formData = new FormData(form);
            const phone = formData.get('phone');
            const groupId = form.getAttribute('data-group-id');
            
            if (!phone || !this.validatePhone(phone)) {
                throw new Error('Please enter a valid phone number');
            }
            
            const group = this.groups.find(g => g.id === groupId);
            if (!group) {
                throw new Error('Group not found');
            }
            
            // Check if user exists in system
            const invitedUser = await this.findUserByPhone(phone);
            if (!invitedUser) {
                throw new Error('User not found in Pesewa system');
            }
            
            // Check if already a member
            if (group.members.some(m => m.id === invitedUser.id)) {
                throw new Error('User is already a member of this group');
            }
            
            // Create invitation
            const invitation = {
                id: 'invite_' + Date.now(),
                groupId: groupId,
                groupName: group.name,
                invitedUserId: invitedUser.id,
                invitedBy: this.getCurrentUser().id,
                status: 'pending',
                createdAt: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
            };
            
            // Save invitation
            this.saveInvitation(invitation);
            
            // Show success
            this.showGroupSuccess(`Invitation sent to ${phone}. They will receive a notification.`);
            
            // Clear form
            form.reset();
            
        } catch (error) {
            this.showGroupError(error.message);
        }
    },

    // Filter groups based on search and filters
    filterGroups(searchTerm = '', country = '', type = '') {
        const filtered = this.groups.filter(group => {
            // Search term filter
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                if (!group.name.toLowerCase().includes(searchLower) &&
                    !group.description.toLowerCase().includes(searchLower) &&
                    !group.country.toLowerCase().includes(searchLower)) {
                    return false;
                }
            }
            
            // Country filter
            if (country && group.country !== country) {
                return false;
            }
            
            // Type filter
            if (type && group.type !== type) {
                return false;
            }
            
            return true;
        });
        
        // Display filtered groups
        this.displayGroups(filtered);
    },

    // Display groups
    displayGroups(groups) {
        const container = document.getElementById('groupsContainer');
        if (!container) return;
        
        if (groups.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">👥</div>
                    <h3>No groups found</h3>
                    <p>Try adjusting your search or filters</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = groups.map(group => this.createGroupCard(group)).join('');
    },

    // Display user's groups
    displayUserGroups() {
        const container = document.getElementById('userGroupsContainer');
        if (!container) return;
        
        if (this.userGroups.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">👥</div>
                    <h3>You haven't joined any groups yet</h3>
                    <p>Join a group to start borrowing or lending</p>
                    <a href="groups.html" class="btn btn-primary">Browse Groups</a>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.userGroups.map(group => this.createGroupCard(group, true)).join('');
    },

    // Display group members
    displayGroupMembers(groupId) {
        const container = document.getElementById('groupMembersContainer');
        if (!container) return;
        
        const group = this.groups.find(g => g.id === groupId);
        if (!group || !group.members) return;
        
        const user = this.getCurrentUser();
        const isAdmin = group.members.some(m => m.id === user?.id && m.role === 'admin');
        
        container.innerHTML = group.members.map(member => `
            <div class="member-card ${member.role === 'admin' ? 'admin' : ''}">
                <div class="member-avatar">${member.name.charAt(0)}</div>
                <div class="member-info">
                    <div class="member-name">${member.name}</div>
                    <div class="member-role">${member.role === 'admin' ? '👑 Admin' : '👤 Member'}</div>
                    <div class="member-joined">Joined ${this.formatDate(member.joinedAt)}</div>
                </div>
                <div class="member-actions">
                    ${isAdmin && member.role !== 'admin' ? `
                        <select class="form-select" data-action="change-member-role" data-member-id="${member.id}" data-group-id="${groupId}">
                            <option value="member" ${member.role === 'member' ? 'selected' : ''}>Member</option>
                            <option value="admin" ${member.role === 'admin' ? 'selected' : ''}>Admin</option>
                        </select>
                        <button class="btn btn-danger btn-sm" data-action="remove-member" data-member-id="${member.id}" data-group-id="${groupId}">Remove</button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    },

    // Create group card HTML
    createGroupCard(group, isUserGroup = false) {
        const user = this.getCurrentUser();
        const isMember = group.members.some(m => m.id === user?.id);
        const isAdmin = group.members.some(m => m.id === user?.id && m.role === 'admin');
        
        return `
            <div class="group-card" data-group-id="${group.id}">
                <div class="group-header">
                    <div class="group-flag">${this.getCountryFlag(group.country)}</div>
                    <div class="group-info">
                        <h3 class="group-name">${group.name}</h3>
                        <div class="group-meta">
                            <span class="group-type">${group.type}</span>
                            <span class="group-country">${group.country}</span>
                            <span class="group-members">👥 ${group.members.length} members</span>
                        </div>
                    </div>
                    ${isUserGroup ? `
                        <div class="group-status">
                            ${isAdmin ? '<span class="badge badge-primary">Admin</span>' : '<span class="badge badge-success">Member</span>'}
                        </div>
                    ` : ''}
                </div>
                
                <div class="group-description">
                    ${group.description}
                </div>
                
                <div class="group-stats">
                    <div class="stat">
                        <div class="stat-label">Lenders</div>
                        <div class="stat-value">${group.lenders.length}</div>
                    </div>
                    <div class="stat">
                        <div class="stat-label">Borrowers</div>
                        <div class="stat-value">${group.borrowers.length}</div>
                    </div>
                    <div class="stat">
                        <div class="stat-label">Total Lent</div>
                        <div class="stat-value">${this.formatCurrency(group.totalLent)}</div>
                    </div>
                    <div class="stat">
                        <div class="stat-label">Repayment Rate</div>
                        <div class="stat-value">${group.repaymentRate}%</div>
                    </div>
                </div>
                
                <div class="group-categories">
                    ${group.categories.map(cat => `<span class="category-tag">${cat}</span>`).join('')}
                </div>
                
                <div class="group-actions">
                    ${isMember ? `
                        <a href="group-details.html?id=${group.id}" class="btn btn-primary">View Group</a>
                        ${isAdmin ? '<a href="group-settings.html?id=${group.id}" class="btn btn-outline">Settings</a>' : ''}
                    ` : `
                        ${group.joinType === 'open' ? `
                            <button class="btn btn-success" data-action="join-group" data-group-id="${group.id}">Join Group</button>
                        ` : `
                            <button class="btn btn-outline" data-action="request-join" data-group-id="${group.id}">Request to Join</button>
                        `}
                        <a href="group-details.html?id=${group.id}" class="btn btn-primary">View Details</a>
                    `}
                </div>
            </div>
        `;
    },

    // Check if user can join more groups
    canJoinMoreGroups(userId) {
        const userGroups = this.groups.filter(group => 
            group.members.some(m => m.id === userId)
        );
        
        return userGroups.length < this.limits.maxGroupsPerUser;
    },

    // Check if user has good reputation
    hasGoodReputation(userId) {
        // For now, check if user has any blacklist history
        // In production, this would check actual reputation score
        const user = this.getUserById(userId);
        return !user?.blacklisted && (!user?.rating || user.rating >= 3);
    },

    // Validate referral code
    validateReferralCode(code, group) {
        return group.referralCode === code;
    },

    // Generate referral code
    generateReferralCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    },

    // Populate country options in select element
    populateCountryOptions(selectElement) {
        const countries = [
            'Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'Burundi',
            'Somalia', 'South Sudan', 'Ethiopia', 'DR Congo',
            'Nigeria', 'Ghana', 'South Africa'
        ];
        
        selectElement.innerHTML = `
            <option value="">Select Country</option>
            ${countries.map(country => `<option value="${country}">${country}</option>`).join('')}
        `;
    },

    // Get country flag emoji
    getCountryFlag(country) {
        const flags = {
            'Kenya': '🇰🇪',
            'Uganda': '🇺🇬',
            'Tanzania': '🇹🇿',
            'Rwanda': '🇷🇼',
            'Burundi': '🇧🇮',
            'Somalia': '🇸🇴',
            'South Sudan': '🇸🇸',
            'Ethiopia': '🇪🇹',
            'DR Congo': '🇨🇩',
            'Nigeria': '🇳🇬',
            'Ghana': '🇬🇭',
            'South Africa': '🇿🇦'
        };
        
        return flags[country] || '🏳️';
    },

    // Get user by ID
    getUserById(userId) {
        const userData = localStorage.getItem('pesewa_user');
        if (userData) {
            try {
                const currentUser = JSON.parse(userData);
                if (currentUser.id === userId) {
                    return currentUser;
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }
        
        // Check mock users
        const mockUsers = JSON.parse(localStorage.getItem('pesewa_mock_users') || '[]');
        return mockUsers.find(u => u.id === userId);
    },

    // Find user by phone
    async findUserByPhone(phone) {
        // Check mock users
        const mockUsers = JSON.parse(localStorage.getItem('pesewa_mock_users') || '[]');
        return mockUsers.find(u => u.phone === phone);
    },

    // Save invitation
    saveInvitation(invitation) {
        const invitations = JSON.parse(localStorage.getItem('pesewa_invitations') || '[]');
        invitations.push(invitation);
        localStorage.setItem('pesewa_invitations', JSON.stringify(invitations));
    },

    // Get current user
    getCurrentUser() {
        if (typeof PesewaAuth !== 'undefined') {
            return PesewaAuth.currentUser;
        }
        
        const userData = localStorage.getItem('pesewa_user');
        if (userData) {
            try {
                return JSON.parse(userData);
            } catch (error) {
                console.error('Error parsing user data:', error);
                return null;
            }
        }
        
        return null;
    },

    // Validate phone number
    validatePhone(phone) {
        const phoneRegex = /^\+?[\d\s\-\(\)]{8,}$/;
        return phoneRegex.test(phone);
    },

    // Format currency
    formatCurrency(amount) {
        return `₵${amount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    },

    // Format date
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    // Show group loading state
    showGroupLoading(show, message = 'Processing...') {
        const buttons = document.querySelectorAll('[data-action^="join"], [data-action^="create"]');
        
        buttons.forEach(button => {
            if (show) {
                const originalText = button.textContent;
                button.setAttribute('data-original-text', originalText);
                button.textContent = message;
                button.disabled = true;
            } else {
                const originalText = button.getAttribute('data-original-text');
                if (originalText) {
                    button.textContent = originalText;
                    button.removeAttribute('data-original-text');
                }
                button.disabled = false;
            }
        });
    },

    // Show group success message
    showGroupSuccess(message) {
        const notification = document.createElement('div');
        notification.className = 'group-notification success';
        notification.innerHTML = `
            <strong>Success:</strong> ${message}
            <button onclick="this.parentElement.remove()" style="float: right; background: none; border: none; color: inherit; cursor: pointer;">×</button>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background-color: var(--trust-mint);
            color: var(--stability-green);
            padding: 12px 16px;
            border-radius: 8px;
            border: 1px solid var(--mutual-green);
            z-index: 9999;
            max-width: 400px;
            animation: fadeInUp 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'fadeOut 0.3s ease-out forwards';
                setTimeout(() => notification.remove(), 300);
            }
        }, 3000);
    },

    // Show group error message
    showGroupError(message) {
        const notification = document.createElement('div');
        notification.className = 'group-notification error';
        notification.innerHTML = `
            <strong>Error:</strong> ${message}
            <button onclick="this.parentElement.remove()" style="float: right; background: none; border: none; color: inherit; cursor: pointer;">×</button>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background-color: var(--warning-background);
            color: var(--gentle-alert);
            padding: 12px 16px;
            border-radius: 8px;
            border: 1px solid var(--gentle-alert);
            z-index: 9999;
            max-width: 400px;
            animation: fadeInUp 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'fadeOut 0.3s ease-out forwards';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    },

    // Create sample groups for demo
    createSampleGroups() {
        return [
            {
                id: 'group_1',
                name: 'Nairobi Professionals',
                description: 'Emergency lending group for professionals working in Nairobi CBD',
                country: 'Kenya',
                type: 'professional',
                joinType: 'referral',
                categories: ['pesewa-fare', 'pesewa-data', 'pesewa-food'],
                createdBy: 'admin_1',
                createdAt: '2024-01-15T08:00:00Z',
                updatedAt: '2024-01-15T08:00:00Z',
                members: [
                    { id: 'user_1', name: 'John Kimani', phone: '+254712345678', role: 'admin', joinedAt: '2024-01-15T08:00:00Z', status: 'active' },
                    { id: 'user_2', name: 'Mary Wambui', phone: '+254723456789', role: 'member', joinedAt: '2024-01-16T10:00:00Z', status: 'active' }
                ],
                lenders: ['user_1'],
                borrowers: ['user_2'],
                totalLoans: 5,
                totalLent: 12500,
                repaymentRate: 100,
                isActive: true,
                referralCode: 'NAIROBI2024',
                settings: {
                    allowCrossGroup: true,
                    requireGuarantors: true,
                    minRating: 4,
                    maxLoanAmount: 5000
                }
            },
            {
                id: 'group_2',
                name: 'Kampala Church Group',
                description: 'Christian community lending group based in Kampala',
                country: 'Uganda',
                type: 'church',
                joinType: 'referral',
                categories: ['pesewa-school-fees', 'pesewa-medicine', 'pesewa-food'],
                createdBy: 'admin_2',
                createdAt: '2024-02-01T09:00:00Z',
                updatedAt: '2024-02-01T09:00:00Z',
                members: [
                    { id: 'user_3', name: 'David Ochieng', phone: '+256712345678', role: 'admin', joinedAt: '2024-02-01T09:00:00Z', status: 'active' }
                ],
                lenders: ['user_3'],
                borrowers: [],
                totalLoans: 2,
                totalLent: 4000,
                repaymentRate: 100,
                isActive: true,
                referralCode: 'KAMPALA2024',
                settings: {
                    allowCrossGroup: false,
                    requireGuarantors: true,
                    minRating: 3,
                    maxLoanAmount: 3000
                }
            }
        ];
    }
};

// Initialize groups when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PesewaGroups.init());
} else {
    PesewaGroups.init();
}

// Export for use in other modules
window.PesewaGroups = PesewaGroups;