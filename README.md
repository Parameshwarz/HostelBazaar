## Notification System

The Hostelbazaar platform includes a real-time notification system that keeps users informed about trades, messages, and system alerts.

### Setting Up the Notification System

1. The notification system requires a database table to store notifications. To set it up:
   - If you're a developer, go to the Settings page and use the "Setup Notification System" button in the Developer Tools section.
   - Or run the migration file manually:
     ```bash
     cat migrations/create_notifications_table.sql | psql your_database_url
     ```

2. Notifications are real-time and will appear in the navigation header when a user receives:
   - New trade offers
   - Messages from other users
   - System alerts and announcements

### Testing Notifications

You can test the notification system by:
1. Going to the Settings page (when logged in)
2. Clicking the "Create Sample Notification" button in the Developer Tools section

### Integration Points

Notifications are automatically generated when:
- A user sends a message to another user
- A user creates a trade offer for another user's item
- System events occur (like price drops, back-in-stock alerts, etc.)

### Technical Notes

The notification system leverages Supabase's real-time capabilities and includes:
- A centralized `useNotifications` hook to retrieve and manage notifications
- Database triggers that automatically create notifications based on certain actions
- A notification service for programmatically creating notifications 