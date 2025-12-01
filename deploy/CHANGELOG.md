# Deployment Script Changelog

## Latest Changes

### Python 3.11 Upgrade
- **Changed**: Upgraded from Python 3.9 to Python 3.11
- **Reason**: Python 3.9 doesn't support modern type hints (`str | None` syntax)
- **Benefits**: 
  - Better type hint support
  - Latest pytest versions (9.0+)
  - Better performance
  - Future-proof

### Fixed Issues
- Fixed systemd service WorkingDirectory (now uses project root)
- Added `--pythonpath` flag to Gunicorn
- Fixed pytest version constraints for Python 3.11
- Improved error handling and diagnostics

### Requirements
- Amazon Linux 2023 (recommended) - has Python 3.11 in repos
- Amazon Linux 2 - may need additional setup for Python 3.11


