// Memory monitoring script for Node.js applications
// This script monitors memory usage and logs warnings when memory usage is high

const os = require('os');
const fs = require('fs');

class MemoryMonitor {
  constructor(options = {}) {
    this.warningThreshold = options.warningThreshold || 80; // 80% memory usage
    this.criticalThreshold = options.criticalThreshold || 90; // 90% memory usage
    this.interval = options.interval || 30000; // Check every 30 seconds
    this.logFile = options.logFile || 'memory-monitor.log';
    this.isMonitoring = false;
  }

  start() {
    if (this.isMonitoring) {
      console.log('Memory monitor is already running');
      return;
    }

    this.isMonitoring = true;
    console.log('Starting memory monitor...');
    
    this.intervalId = setInterval(() => {
      this.checkMemoryUsage();
    }, this.interval);

    // Check immediately
    this.checkMemoryUsage();
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isMonitoring = false;
    console.log('Memory monitor stopped');
  }

  checkMemoryUsage() {
    const memUsage = process.memoryUsage();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    
    const processMemPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    const systemMemPercent = (usedMem / totalMem) * 100;

    const logEntry = {
      timestamp: new Date().toISOString(),
      process: {
        rss: this.formatBytes(memUsage.rss),
        heapTotal: this.formatBytes(memUsage.heapTotal),
        heapUsed: this.formatBytes(memUsage.heapUsed),
        external: this.formatBytes(memUsage.external),
        arrayBuffers: this.formatBytes(memUsage.arrayBuffers),
        heapUsedPercent: processMemPercent.toFixed(2) + '%'
      },
      system: {
        total: this.formatBytes(totalMem),
        used: this.formatBytes(usedMem),
        free: this.formatBytes(freeMem),
        usedPercent: systemMemPercent.toFixed(2) + '%'
      }
    };

    // Log to console
    console.log(`Memory Usage - Process: ${logEntry.process.heapUsedPercent}, System: ${logEntry.system.usedPercent}`);

    // Log to file
    this.logToFile(logEntry);

    // Check thresholds
    if (processMemPercent > this.criticalThreshold) {
      console.error(`🚨 CRITICAL: Process memory usage is ${processMemPercent.toFixed(2)}%`);
      this.triggerGarbageCollection();
    } else if (processMemPercent > this.warningThreshold) {
      console.warn(`⚠️  WARNING: Process memory usage is ${processMemPercent.toFixed(2)}%`);
    }

    if (systemMemPercent > this.criticalThreshold) {
      console.error(`🚨 CRITICAL: System memory usage is ${systemMemPercent.toFixed(2)}%`);
    } else if (systemMemPercent > this.warningThreshold) {
      console.warn(`⚠️  WARNING: System memory usage is ${systemMemPercent.toFixed(2)}%`);
    }
  }

  triggerGarbageCollection() {
    if (global.gc) {
      console.log('Triggering garbage collection...');
      global.gc();
    } else {
      console.log('Garbage collection not available. Start with --expose-gc flag');
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  logToFile(logEntry) {
    const logLine = JSON.stringify(logEntry) + '\n';
    fs.appendFileSync(this.logFile, logLine);
  }
}

// Export for use in other modules
module.exports = MemoryMonitor;

// If run directly, start monitoring
if (require.main === module) {
  const monitor = new MemoryMonitor({
    warningThreshold: 70,
    criticalThreshold: 85,
    interval: 10000 // Check every 10 seconds
  });

  monitor.start();

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\nShutting down memory monitor...');
    monitor.stop();
    process.exit(0);
  });
}
