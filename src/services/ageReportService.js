const dbService = require('./dbService');

class AgeReportService {
    /**
     * Generate age distribution report
     * @returns {Object} Age distribution report with percentages
     */
    async generateAgeReport() {
        try {
            const ageData = await dbService.getAgeDistribution();
            
            const totalUsers = parseInt(ageData.total_users);
            
            if (totalUsers === 0) {
                return {
                    message: 'No users found in database',
                    distribution: {}
                };
            }

            const distribution = {
                '< 20': {
                    count: parseInt(ageData.under_20),
                    percentage: this.calculatePercentage(ageData.under_20, totalUsers)
                },
                '20 to 40': {
                    count: parseInt(ageData.age_20_to_40),
                    percentage: this.calculatePercentage(ageData.age_20_to_40, totalUsers)
                },
                '40 to 60': {
                    count: parseInt(ageData.age_40_to_60),
                    percentage: this.calculatePercentage(ageData.age_40_to_60, totalUsers)
                },
                '> 60': {
                    count: parseInt(ageData.over_60),
                    percentage: this.calculatePercentage(ageData.over_60, totalUsers)
                }
            };

            // Print report to console
            this.printAgeReportToConsole(distribution, totalUsers);

            return {
                totalUsers,
                distribution
            };

        } catch (error) {
            console.error('Error generating age report:', error);
            throw error;
        }
    }

    /**
     * Calculate percentage with proper rounding
     * @param {number} count - Count of users in age group
     * @param {number} total - Total number of users
     * @returns {number} Percentage rounded to 1 decimal place
     */
    calculatePercentage(count, total) {
        if (total === 0) return 0;
        return Math.round((count / total) * 100 * 10) / 10;
    }

    /**
     * Print formatted age report to console
     * @param {Object} distribution - Age distribution data
     * @param {number} totalUsers - Total number of users
     */
    printAgeReportToConsole(distribution, totalUsers) {
        console.log('\n' + '='.repeat(50));
        console.log('AGE DISTRIBUTION REPORT');
        console.log('='.repeat(50));
        console.log(`Total Users: ${totalUsers}`);
        console.log('-'.repeat(50));
        console.log('Age-Group'.padEnd(15) + '% Distribution'.padEnd(15) + 'Count');
        console.log('-'.repeat(50));
        
        Object.entries(distribution).forEach(([ageGroup, data]) => {
            console.log(
                ageGroup.padEnd(15) + 
                `${data.percentage}%`.padEnd(15) + 
                data.count
            );
        });
        
        console.log('='.repeat(50) + '\n');
    }

    /**
     * Get detailed age statistics
     * @returns {Object} Detailed age statistics
     */
    async getDetailedAgeStatistics() {
        try {
            const users = await dbService.getAllUsers();
            
            if (users.length === 0) {
                return {
                    message: 'No users found',
                    statistics: {}
                };
            }

            const ages = users.map(user => user.age);
            
            const statistics = {
                totalUsers: users.length,
                averageAge: this.calculateAverage(ages),
                medianAge: this.calculateMedian(ages),
                minAge: Math.min(...ages),
                maxAge: Math.max(...ages),
                ageDistribution: await this.generateAgeReport()
            };

            return statistics;

        } catch (error) {
            console.error('Error generating detailed statistics:', error);
            throw error;
        }
    }

    /**
     * Calculate average age
     * @param {Array} ages - Array of ages
     * @returns {number} Average age
     */
    calculateAverage(ages) {
        return Math.round((ages.reduce((sum, age) => sum + age, 0) / ages.length) * 10) / 10;
    }

    /**
     * Calculate median age
     * @param {Array} ages - Array of ages
     * @returns {number} Median age
     */
    calculateMedian(ages) {
        const sorted = [...ages].sort((a, b) => a - b);
        const middle = Math.floor(sorted.length / 2);
        
        if (sorted.length % 2 === 0) {
            return (sorted[middle - 1] + sorted[middle]) / 2;
        } else {
            return sorted[middle];
        }
    }
}

module.exports = new AgeReportService();
