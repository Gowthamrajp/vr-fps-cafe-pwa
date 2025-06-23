export default function PrivacyContent() {
  return (
    <div style="color: var(--text-primary);">
      <p><strong>Last updated:</strong> {new Date().toLocaleDateString()}</p>
      
      <h3>1. Information We Collect</h3>
      <p>We collect information you provide directly to us:</p>
      <ul>
        <li><strong>Personal Information:</strong> Name, age, gender, phone number</li>
        <li><strong>Profile Information:</strong> Display picture (optional), gaming preferences</li>
        <li><strong>Usage Data:</strong> Gaming statistics, booking history, app usage</li>
        <li><strong>Communication Data:</strong> Support messages, feedback</li>
      </ul>
      
      <h3>2. How We Use Your Information</h3>
      <p>We use the information we collect to:</p>
      <ul>
        <li>Provide and maintain VR FPS Cafe services</li>
        <li>Process bookings and manage your account</li>
        <li>Track gaming statistics and achievements</li>
        <li>Send important service updates and notifications</li>
        <li>Improve our services and user experience</li>
        <li>Provide customer support</li>
      </ul>
      
      <h3>3. Information Sharing</h3>
      <p>We do not sell, trade, or rent your personal information. We may share information:</p>
      <ul>
        <li><strong>With Your Consent:</strong> When you explicitly agree</li>
        <li><strong>Service Providers:</strong> Third-party services that help us operate (Firebase, payment processors)</li>
        <li><strong>Legal Requirements:</strong> When required by law or to protect rights</li>
        <li><strong>Leaderboards:</strong> Anonymous gaming statistics for rankings</li>
      </ul>
      
      <h3>4. Data Security</h3>
      <p>We implement appropriate security measures to protect your information:</p>
      <ul>
        <li>Secure data transmission using HTTPS/SSL encryption</li>
        <li>Firebase security rules to protect database access</li>
        <li>Phone number verification for account security</li>
        <li>Regular security audits and updates</li>
      </ul>
      
      <h3>5. Your Rights and Choices</h3>
      <p>You have the right to:</p>
      <ul>
        <li><strong>Access:</strong> Request a copy of your personal data</li>
        <li><strong>Update:</strong> Modify your profile information anytime</li>
        <li><strong>Delete:</strong> Request deletion of your account and data</li>
        <li><strong>Opt-out:</strong> Unsubscribe from non-essential communications</li>
        <li><strong>Data Portability:</strong> Export your gaming data</li>
      </ul>
      
      <h3>6. Cookies and Tracking</h3>
      <p>We use minimal tracking technologies:</p>
      <ul>
        <li><strong>Local Storage:</strong> To remember your preferences and login state</li>
        <li><strong>Analytics:</strong> Firebase Analytics to understand app usage (anonymous)</li>
        <li><strong>Performance:</strong> Monitoring to improve app performance</li>
      </ul>
      
      <h3>7. Children's Privacy</h3>
      <p>Our service is designed for users 13 years and older. For users under 18:</p>
      <ul>
        <li>Parental consent may be required for certain features</li>
        <li>We collect minimal necessary information</li>
        <li>Parents can request access or deletion of their child's data</li>
      </ul>
      
      <h3>8. Data Retention</h3>
      <p>We retain your information:</p>
      <ul>
        <li><strong>Account Data:</strong> Until you delete your account</li>
        <li><strong>Gaming Statistics:</strong> For leaderboards and historical tracking</li>
        <li><strong>Support Data:</strong> For 2 years after resolution</li>
        <li><strong>Legal Requirements:</strong> As required by applicable law</li>
      </ul>
      
      <h3>9. International Data Transfers</h3>
      <p>Your data may be transferred to and processed in:</p>
      <ul>
        <li>Google Firebase servers (global infrastructure)</li>
        <li>Countries where our service providers operate</li>
        <li>All transfers comply with applicable data protection laws</li>
      </ul>
      
      <h3>10. Changes to This Policy</h3>
      <p>We may update this Privacy Policy periodically. We will:</p>
      <ul>
        <li>Notify users of material changes via app notification</li>
        <li>Update the "Last updated" date</li>
        <li>Continue to protect your information according to this policy</li>
      </ul>
      
      <h3>11. Contact Us</h3>
      <p>For privacy-related questions or requests:</p>
      <ul>
        <li>Email: privacy@fps-vr.web.app</li>
        <li>Support: support@fps-vr.web.app</li>
        <li>Phone: +91 XXXXX XXXXX</li>
        <li>Address: [Your VR Cafe Address]</li>
      </ul>
    </div>
  );
} 