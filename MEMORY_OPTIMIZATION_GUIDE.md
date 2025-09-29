# Memory Optimization Guide

This guide helps you resolve and prevent "JavaScript heap out of memory" errors in your Tantor Learning API.

## 🚨 **Immediate Solutions**

### 1. **Start with Increased Memory Limit**
```bash
# Windows
npm run start:dev:memory

# Or manually set memory limit
set NODE_OPTIONS=--max-old-space-size=4096
npm run start:dev

# Linux/Mac
export NODE_OPTIONS="--max-old-space-size=4096"
npm run start:dev
```

### 2. **Use Memory-Optimized Scripts**
```bash
# Development with memory monitoring
npm run start:dev:monitor

# Production with memory limit
npm run start:prod

# Monitor memory usage separately
npm run monitor-memory
```

## 🔧 **Root Causes & Solutions**

### **Primary Cause: MediasoupService**
The MediasoupService (WebRTC) is the main memory consumer. It has been optimized with:

- **Reduced logging** to save memory
- **Port range limits** (10000-10100)
- **Automatic restart** on worker death
- **Proper cleanup** methods

### **Secondary Causes:**
1. **Sharp Image Processing** - Rebuilds for Linux on Windows
2. **Large Data Processing** - Database queries with large result sets
3. **Memory Leaks** - Unclosed connections or event listeners

## 📊 **Memory Monitoring**

### **Real-time Monitoring**
```bash
# Start memory monitor
npm run monitor-memory

# Monitor logs
tail -f memory-monitor.log
```

### **Manual Memory Check**
```javascript
// Add to your code for debugging
console.log('Memory Usage:', process.memoryUsage());
console.log('Heap Used:', Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB');
```

## 🛠️ **Optimization Strategies**

### **1. Node.js Memory Settings**
```bash
# Increase heap size (default is ~1.4GB)
--max-old-space-size=4096  # 4GB
--max-old-space-size=8192  # 8GB

# Enable garbage collection
--expose-gc

# Optimize for production
--optimize-for-size
```

### **2. Application-Level Optimizations**

#### **Database Queries**
```typescript
// ❌ Bad: Loading all data
const lessons = await this.lessonModel.findAll();

// ✅ Good: Pagination
const lessons = await this.lessonModel.findAll({
  limit: 50,
  offset: 0,
  attributes: ['id', 'title', 'description'] // Only needed fields
});
```

#### **Memory Cleanup**
```typescript
// Add to your services
async cleanup() {
  // Close connections
  // Clear caches
  // Remove event listeners
}
```

### **3. Environment-Specific Optimizations**

#### **Development**
```bash
# Use memory-optimized development
npm run start:dev:monitor

# Or with custom memory limit
node --max-old-space-size=4096 --expose-gc node_modules/@nestjs/cli/bin/nest.js start --watch
```

#### **Production**
```bash
# Use optimized production build
npm run build
npm run start:prod

# Or with custom settings
node --max-old-space-size=8192 --optimize-for-size dist/main.js
```

## 🔍 **Diagnostic Commands**

### **Check Current Memory Usage**
```bash
# Windows
tasklist /FI "IMAGENAME eq node.exe"

# Linux/Mac
ps aux | grep node
top -p $(pgrep node)
```

### **Monitor Memory in Real-time**
```bash
# Windows PowerShell
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Select-Object ProcessName, WorkingSet, CPU

# Linux/Mac
watch -n 1 'ps aux | grep node'
```

## 🚀 **Prevention Strategies**

### **1. Regular Monitoring**
- Set up memory alerts at 80% usage
- Monitor memory trends over time
- Log memory usage in production

### **2. Code Best Practices**
```typescript
// ✅ Good: Proper cleanup
class MyService {
  private connections: Set<Connection> = new Set();
  
  async cleanup() {
    for (const conn of this.connections) {
      await conn.close();
    }
    this.connections.clear();
  }
}

// ❌ Bad: Memory leaks
class BadService {
  private connections: Connection[] = [];
  // Never cleans up connections
}
```

### **3. Database Optimization**
```typescript
// Use proper indexing
// Limit result sets
// Use streaming for large data
// Close connections properly
```

## 📋 **Troubleshooting Checklist**

### **When Memory Error Occurs:**

1. **Check Current Usage**
   ```bash
   npm run monitor-memory
   ```

2. **Restart with More Memory**
   ```bash
   npm run start:dev:memory
   ```

3. **Check for Memory Leaks**
   - Look for unclosed database connections
   - Check for event listeners not being removed
   - Verify proper cleanup in services

4. **Optimize Database Queries**
   - Add pagination
   - Select only needed fields
   - Use proper indexing

5. **Monitor MediasoupService**
   - Check WebRTC connections
   - Verify proper cleanup
   - Monitor worker health

## 🔧 **Advanced Solutions**

### **1. Cluster Mode (Production)**
```typescript
// Use PM2 or cluster module
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  // Start your app
}
```

### **2. Memory Profiling**
```bash
# Generate heap snapshot
node --inspect --max-old-space-size=4096 dist/main.js

# Use Chrome DevTools to analyze memory usage
# chrome://inspect
```

### **3. Docker Memory Limits**
```dockerfile
# In Dockerfile
ENV NODE_OPTIONS="--max-old-space-size=4096"

# In docker-compose.yml
services:
  app:
    deploy:
      resources:
        limits:
          memory: 4G
```

## 📞 **Emergency Recovery**

### **If Application Crashes:**
1. **Check logs** for memory errors
2. **Restart with increased memory**
3. **Monitor memory usage**
4. **Identify the cause**
5. **Apply appropriate fix**

### **Quick Recovery Commands:**
```bash
# Kill all Node processes
taskkill /F /IM node.exe  # Windows
pkill -f node            # Linux/Mac

# Restart with memory limit
npm run start:dev:memory
```

## 📈 **Performance Monitoring**

### **Key Metrics to Watch:**
- **Heap Used**: Should stay below 80% of limit
- **RSS Memory**: Total memory usage
- **External Memory**: C++ objects memory
- **Array Buffers**: Binary data memory

### **Warning Signs:**
- Memory usage consistently above 70%
- Gradual memory increase over time
- Frequent garbage collection
- Slow response times

## 🎯 **Best Practices Summary**

1. **Always use memory limits** in production
2. **Monitor memory usage** regularly
3. **Implement proper cleanup** in services
4. **Optimize database queries**
5. **Use pagination** for large datasets
6. **Close connections** properly
7. **Remove event listeners** when done
8. **Profile memory usage** periodically

This guide should help you resolve and prevent memory issues in your Tantor Learning API! 🚀
