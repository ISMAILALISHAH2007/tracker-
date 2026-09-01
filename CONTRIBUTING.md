# Contributing to Family Location Tracker

Thank you for considering contributing to the Family Location Tracker project. This document provides guidelines and instructions for contributing.

## Code of Conduct

Be respectful and inclusive. This project is meant to help families stay connected safely.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in Issues
2. Create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Browser/device information
   - Console errors if any

### Suggesting Features

1. Check if the feature has been suggested
2. Create an issue describing:
   - The problem it solves
   - Proposed solution
   - Alternative approaches considered
   - Impact on existing functionality

### Pull Requests

1. Fork the repository
2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. Make your changes following the code style
4. Test thoroughly
5. Commit with clear messages:
   ```bash
   git commit -m "Add feature: description"
   ```

6. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

7. Open a Pull Request with:
   - Clear description of changes
   - Related issue numbers
   - Screenshots for UI changes
   - Testing performed

## Development Setup

See README.md for complete setup instructions.

```bash
# Clone your fork
git clone https://github.com/your-username/family-tracker.git
cd family-tracker

# Install dependencies
npm install
cd api && npm install && cd ..

# Create .env files
cp .env.example .env
cp api/.env.example api/.env

# Start development servers
npm run dev
cd api && npm run dev
```

## Code Style

### JavaScript/React

- Use ES6+ features
- Functional components with hooks
- Descriptive variable names
- Comments for complex logic
- Keep components small and focused

### Example:

```javascript
// Good
const LocationMarker = ({ position, name, isActive }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <Marker
      longitude={position.lng}
      latitude={position.lat}
      onMouseEnter={() => setIsHovered(true)}
    >
      <MarkerIcon isActive={isActive} />
    </Marker>
  );
};

// Avoid
const LM = (p) => <Marker longitude={p.pos.lng} latitude={p.pos.lat}><MI active={p.a}/></Marker>
```

### CSS/Tailwind

- Use Tailwind utility classes
- Custom CSS only when necessary
- Mobile-first responsive design
- Consistent spacing and colors

## Project Structure

```
family-tracker/
├── src/               # Frontend source
│   ├── components/    # React components
│   ├── hooks/         # Custom React hooks
│   ├── utils/         # Utility functions
│   └── App.jsx        # Main app component
├── api/               # Backend API
│   ├── server.js      # Express server
│   ├── routes/        # API routes
│   └── utils/         # Backend utilities
├── public/            # Static assets
│   ├── icons/         # PWA icons
│   └── manifest.json  # PWA manifest
└── docs/              # Documentation
```

## Testing Guidelines

### Manual Testing

Before submitting a PR, test:

1. **Tracker Role**:
   - Location updates correctly
   - Low battery mode works
   - Reconnection after disconnect

2. **Monitor Role**:
   - Sees all trackers
   - Geofence notifications work
   - Map updates in real-time

3. **Cross-browser**:
   - Chrome/Edge
   - Firefox
   - Safari (iOS)

4. **Responsive Design**:
   - Mobile portrait
   - Mobile landscape
   - Tablet
   - Desktop

### Automated Testing

Future enhancement: Jest and React Testing Library setup

## Security Considerations

- Never commit API keys or tokens
- Use environment variables for sensitive data
- Validate all user inputs
- Sanitize location data before broadcasting
- Implement rate limiting for API endpoints
- Use HTTPS in production

## Performance Guidelines

- Minimize location update frequency
- Debounce/throttle rapid updates
- Optimize map rendering
- Reduce bundle size
- Lazy load components when possible
- Cache map tiles

## Accessibility

- Semantic HTML
- ARIA labels where needed
- Keyboard navigation support
- Color contrast compliance
- Screen reader friendly
- Focus indicators

## Documentation

Update documentation when:
- Adding new features
- Changing configuration
- Modifying APIs
- Adding dependencies
- Updating deployment process

## Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Formatting, missing semicolons
- refactor: Code restructuring
- test: Adding tests
- chore: Maintenance

**Examples**:
```
feat(tracker): add low battery mode

Implements battery-saving mode that reduces location update frequency
from 10s to 60s when enabled.

Closes #42
```

```
fix(geofence): correct radius calculation

Fixed distance calculation that was using degrees instead of meters,
causing incorrect geofence triggers.

Fixes #38
```

## Review Process

1. All PRs require review before merging
2. Address review comments
3. Keep PRs focused and small
4. Rebase on main before merging
5. Squash commits if needed

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

Feel free to open an issue for:
- Questions about contributing
- Clarification on guidelines
- Discussion of ideas

## Priority Areas for Contribution

### High Priority
- User authentication system
- Persistent storage (database)
- Unit and integration tests
- Performance optimization
- Battery usage optimization

### Medium Priority
- Location history and timeline
- Custom notification preferences
- Multiple geofence groups
- Route tracking and playback
- Admin dashboard

### Low Priority
- SOS/emergency button
- Multi-language support
- Dark mode enhancements
- Custom map styles
- Export location data

## Getting Help

- Read the README.md and documentation
- Check existing issues and discussions
- Open a new issue for questions
- Tag issues with appropriate labels

Thank you for contributing to Family Location Tracker!
