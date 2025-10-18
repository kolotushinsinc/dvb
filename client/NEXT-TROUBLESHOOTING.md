# Next.js Troubleshooting Guide

## Common Issues and Solutions

### `TypeError: __webpack_require__.C is not a function`

This error typically occurs due to webpack cache corruption. It can happen when:

- The development server is interrupted abruptly
- There are file system permission issues
- There are conflicts between dependencies
- The `.next` directory becomes corrupted

## Quick Fix Scripts

We've created two scripts to help you resolve these issues:

### 1. Simple Cache Clearing Script

```bash
./clear-cache.sh
```

This script:
- Clears the Next.js cache (removes the `.next` directory)
- Restarts the development server

### 2. Comprehensive Fix Script

```bash
./fix-next-issues.sh [dev|build]
```

This script provides a more thorough solution:
- Clears the Next.js cache
- Optionally reinstalls node_modules to fix dependency issues
- Updates the browserslist database
- Fixes potential file permission issues
- Starts the development server or builds for production

Use the `dev` parameter (or no parameter) to start the development server after fixing:
```bash
./fix-next-issues.sh dev
```

Use the `build` parameter to build for production after fixing:
```bash
./fix-next-issues.sh build
```

## Manual Solutions

If the scripts don't resolve your issue, you can try these manual steps:

1. **Clear the Next.js cache**
   ```bash
   rm -rf .next
   ```

2. **Reinstall dependencies**
   ```bash
   rm -rf node_modules
   npm install
   ```

3. **Update browserslist database**
   ```bash
   npx update-browserslist-db@latest
   ```

4. **Check for file permission issues**
   ```bash
   chmod -R 755 .next
   chmod -R 755 node_modules
   ```

5. **Check for disk space issues**
   ```bash
   df -h
   ```

## Prevention Tips

To prevent these issues from occurring:

1. Always use `Ctrl+C` to properly shut down the development server
2. Keep your dependencies up to date
3. Ensure you have sufficient disk space
4. Periodically clear the Next.js cache
5. Use version control to track changes

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Webpack Documentation](https://webpack.js.org/concepts/)
- [Node.js Troubleshooting Guide](https://nodejs.org/en/docs/guides/debugging-getting-started/)
