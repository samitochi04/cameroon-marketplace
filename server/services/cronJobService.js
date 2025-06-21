const cron = require('node-cron');
const stockService = require('./stockService');
const refundService = require('./refundService');

class CronJobService {
  constructor() {
    this.jobs = [];
    this.isRunning = false;
  }
  
  // Start all cron jobs
  startJobs() {
    if (this.isRunning) {
      console.log('Cron jobs are already running');
      return;
    }
    
    console.log('Starting cron jobs...');
      // Check for low stock every 6 hours
    const stockCheckJob = cron.schedule('0 */6 * * *', async () => {
      console.log('Running scheduled stock check...');
      try {
        await stockService.checkAllProductsForLowStock();
      } catch (error) {
        console.error('Error in scheduled stock check:', error);
      }
    }, {
      scheduled: false,
      timezone: "Africa/Douala"
    });
    
    // Check for delayed orders and process refunds every 2 hours
    const refundCheckJob = cron.schedule('0 */2 * * *', async () => {
      console.log('Running scheduled delayed order check...');
      try {
        await refundService.checkAndProcessDelayedOrders();
      } catch (error) {
        console.error('Error in scheduled refund check:', error);
      }
    }, {
      scheduled: false,
      timezone: "Africa/Douala"
    });
    
    this.jobs.push({
      name: 'stock-check',
      job: stockCheckJob,
      schedule: 'Every 6 hours'
    });
    
    this.jobs.push({
      name: 'delayed-order-refund',
      job: refundCheckJob,
      schedule: 'Every 2 hours'
    });
    
    // Start all jobs
    this.jobs.forEach(jobInfo => {
      jobInfo.job.start();
      console.log(`Started cron job: ${jobInfo.name} (${jobInfo.schedule})`);
    });
    
    this.isRunning = true;
  }
  
  // Stop all cron jobs
  stopJobs() {
    if (!this.isRunning) {
      console.log('Cron jobs are not running');
      return;
    }
    
    console.log('Stopping cron jobs...');
    
    this.jobs.forEach(jobInfo => {
      jobInfo.job.stop();
      console.log(`Stopped cron job: ${jobInfo.name}`);
    });
    
    this.isRunning = false;
  }
  
  // Get status of all jobs
  getJobsStatus() {
    return {
      isRunning: this.isRunning,
      jobs: this.jobs.map(jobInfo => ({
        name: jobInfo.name,
        schedule: jobInfo.schedule,
        running: jobInfo.job.running
      }))
    };
  }
    // Manual trigger for stock check (for testing)
  async manualStockCheck() {
    console.log('Manual stock check triggered...');
    try {
      await stockService.checkAllProductsForLowStock();
      return { success: true, message: 'Stock check completed successfully' };
    } catch (error) {
      console.error('Error in manual stock check:', error);
      return { success: false, message: error.message };
    }
  }
  
  // Manual trigger for delayed order refund check (for testing)
  async manualDelayedOrderCheck() {
    console.log('Manual delayed order check triggered...');
    try {
      const result = await refundService.checkAndProcessDelayedOrders();
      return { 
        success: true, 
        message: 'Delayed order check completed successfully',
        data: result
      };
    } catch (error) {
      console.error('Error in manual delayed order check:', error);
      return { success: false, message: error.message };
    }
  }
}

module.exports = new CronJobService();