# 📚 Create Billings App - Complete User Guide

> **Professional TV Metadata Content Versioning Tool**  
> Generate multiple versions of TV programme billings following PA TV style guidelines

## 🚀 Quick Start

### 1. Access the App
- **Local Development**: http://localhost:3000
- **Production**: https://create-tv-billings.vercel.app

### 2. Create Your Account
1. Enter your email address
2. Create a secure 4-digit PIN
3. Confirm your PIN
4. You're ready to go!

### 3. Add Your API Key
1. Get your API key from [Anthropic Console](https://console.anthropic.com/account/keys)
2. Click **Settings** in the header
3. Enter your API key (starts with `sk-ant-`)
4. Save and start generating content!

---

## 📖 Table of Contents

1. [Getting Started](#getting-started)
2. [Core Features](#core-features)
3. [Advanced Features](#advanced-features)
4. [New Features](#new-features)
5. [Settings & Configuration](#settings--configuration)
6. [Tips & Best Practices](#tips--best-practices)
7. [Troubleshooting](#troubleshooting)
8. [Privacy & Security](#privacy--security)

---

## 🎯 Getting Started

### Authentication System
The app uses a simple yet secure PIN-based authentication system:

- **Registration**: Email + 4-digit PIN
- **Login**: Email + PIN
- **Security**: All data stored locally per user
- **Multi-user**: Multiple accounts supported on same device

### First-Time Setup
1. **Create Account**: Register with email and PIN
2. **API Key**: Add your Anthropic API key in Settings
3. **Test Generation**: Try generating content with sample text
4. **Explore Features**: Check out Style Presets and Custom Limits

---

## 🔧 Core Features

### 1. Content Generation Engine

The heart of the app - generates multiple versions of TV programme billings:

#### **How It Works**
1. **Input**: Paste your original programme description
2. **Style**: Select from 8 built-in styles or create custom presets
3. **Generate**: Click to create 3 versions (90, 180, 700 characters)
4. **Refine**: Edit character limits or try different styles
5. **Export**: Save in multiple formats for different uses

#### **Built-in Styles**
- **Default**: Standard PA TV style guide
- **Drama**: Dramatic storytelling approach
- **Documentary**: Factual and informative tone
- **Soap**: Soap opera style
- **Sitcom**: Situational comedy approach
- **Quiz**: Quiz show format
- **Movie**: Feature film style
- **Music**: Music programme style
- **Sport**: Sports coverage style

#### **Character Limits**
- **Version 1**: 90 characters (short descriptions)
- **Version 2**: 180 characters (medium descriptions)
- **Version 3**: 700 characters (long descriptions)
- **Custom**: Define your own limits (1-6 versions supported)

### 2. Style Presets System

Create and manage custom style rules for consistent content generation:

#### **Creating Style Presets**
1. Click **Style Presets** button
2. Click **Create New Preset**
3. Configure your preset:
   - **Name**: E.g., "Drama Series"
   - **Description**: Brief explanation
   - **Style Rules**: Choose options like British English, no full stops
   - **Character Limits**: Set custom limits
   - **Forbidden Words**: Words to avoid
   - **Custom Instructions**: Additional guidelines

#### **Style Rules Options**
- **British English**: Uses British spelling (colour, programme, centre)
- **No Full Stops**: Prevents trailing periods
- **Include Descriptors**: Adds context for people mentioned
- **Avoid Repetition**: Prevents redundant information
- **Custom Instructions**: Your specific requirements

#### **🆕 NEW: Style Transparency**
- **Preview AI Instructions**: See exactly what the AI receives
- **Full Prompt View**: View complete AI prompt
- **Live Updates**: See changes as you edit rules
- **Sample Testing**: Test with your own content
- **Rule Impact**: Understand how each rule affects output

### 3. Custom Character Limits

Tailor output to your specific needs:

#### **Modifying Limits**
1. Click **Custom Limits** button
2. Add/remove/edit limits
3. Choose between character or word counting
4. Set labels for each version
5. Apply changes to generate new content

#### **Quick Presets**
- **Social Media**: Twitter, Instagram, LinkedIn formats
- **Email**: Subject lines and preview text
- **Web**: Meta descriptions and titles
- **Broadcast**: Various TV metadata requirements

#### **Dynamic UI**
- Layout automatically adapts to number of versions
- Supports 1-6 versions with optimized grid layouts
- Real-time character counting with over-limit warnings
- Visual indicators for content that exceeds limits

### 4. History & Tracking

Keep track of all your generated content:

#### **History Features**
- **Complete Record**: All generated content with timestamps
- **Style Tracking**: See which style was used for each generation
- **Original Input**: View the source text for each generation
- **All Versions**: Access all generated versions
- **User-Specific**: Each user sees only their own history

#### **History Management**
- **View Details**: Click any history item for full details
- **Delete Items**: Remove individual entries
- **Clear All**: Start fresh with empty history
- **Export**: Save history data in various formats

---

## 🚀 Advanced Features

### 1. Batch Processing

Process multiple pieces of content simultaneously:

#### **How to Use Batch Processing**
1. Click **Batch Process** button
2. Add content using one of these methods:
   - **Manual Entry**: Type or paste each item
   - **Import Text**: Upload a text file with multiple items
   - **Bulk Paste**: Paste multiple items separated by line breaks
3. Select your style preset
4. Click **Process All**
5. Monitor progress and review results

#### **Batch Features**
- **Progress Tracking**: Real-time processing status
- **Bulk Export**: Export all results at once
- **Error Handling**: Skip items that fail processing
- **Style Consistency**: Apply same style to all items

### 2. Export System

Save your work in multiple formats:

#### **Export Formats**
- **CSV Spreadsheet**: For Excel, Google Sheets, Numbers
- **JSON Data**: For technical integrations and APIs
- **HTML Report**: Formatted web page with styling
- **Social Media**: Pre-formatted for Twitter, LinkedIn

#### **Export Options**
- **Include Metadata**: Add timestamps, styles, character counts
- **Custom Formatting**: Choose what information to include
- **Multiple Files**: Export different versions separately
- **Bulk Export**: Export entire history or batch results

#### **Single vs. Batch Export**
- **Single**: Export current generation results
- **Batch**: Export all batch processing results
- **History**: Export entire generation history
- **Selective**: Choose specific items to export

### 3. 🆕 Excel Analysis Tool

**NEW FEATURE**: Advanced content analysis and comparison:

#### **What It Does**
- Compares two versions of content (Version 1 vs Version 2)
- Provides quality scoring and readability analysis
- Checks PA TV style guide compliance
- Offers detailed improvement suggestions
- Generates comprehensive reports

#### **How to Use**
1. Click **Excel Analysis** button
2. Upload Excel file with your content columns
3. Map columns to Version 1 and Version 2
4. Optionally set identifier column
5. Click **Analyze Content**
6. Review detailed comparison results
7. Export analysis results

#### **Analysis Features**
- **Quality Scoring**: 0-100 score based on multiple factors
- **Readability**: Flesch Reading Ease score
- **Style Compliance**: PA TV style guide checking
- **Word/Character Analysis**: Detailed text metrics
- **Improvement Suggestions**: Specific recommendations
- **Winner Determination**: Which version performs better
- **Overall Reporting**: Summary statistics and trends

#### **Excel Template**
- Download pre-built Excel template
- Structured format for consistent analysis
- Example content included
- Easy column mapping

---

## 🆕 New Features

### 1. Style Preset Transparency

**Revolutionary new feature**: See exactly what the AI is doing!

#### **AI Instructions Preview**
- **Full Transparency**: See every instruction sent to the AI
- **Rule-by-Rule Breakdown**: Understand each style rule's impact
- **Live Updates**: Preview changes as you edit presets
- **Sample Testing**: Test rules with your own content
- **Prompt Debugging**: Troubleshoot style issues

#### **How to Access**
- **Creating Presets**: Preview appears automatically while editing
- **Existing Presets**: Click 👁️ eye icon next to any preset
- **Active Preset**: Toggle preview on main screen
- **Full Prompt View**: See complete AI prompt with your content

#### **What You'll See**
- **Numbered Rules**: Each instruction with examples
- **Rule Impact**: How each rule affects the output
- **Strengths/Issues**: What works well and what to improve
- **Optimization Tips**: Guidance for better results

### 2. Enhanced Character Limit Enforcement

**Guaranteed accuracy**: Version 1 never exceeds 90 characters!

#### **Improvements**
- **Stricter AI Prompts**: "MUST NOT exceed" instead of "Maximum"
- **Client-Side Validation**: Automatic truncation if needed
- **Real-Time Counting**: Live character count display
- **Visual Warnings**: Red indicators for over-limit content
- **Double Protection**: AI instructions + client-side backup

#### **Visual Indicators**
- **Character Count**: Shows "85/90 chars" format
- **Over-Limit Warning**: Red "OVER LIMIT" badge
- **Border Colors**: Red borders for exceeded limits
- **Progress Indicators**: Visual feedback on limit proximity

### 3. Active Style Preview

**Always know what's active**: See current style rules at a glance

#### **Features**
- **Current Style Display**: Shows active preset name
- **Rule Count**: Number of active rules
- **Quick Preview**: Toggle to see all active instructions
- **Direct Access**: Click to modify current style
- **Real-Time Updates**: Reflects changes immediately

---

## ⚙️ Settings & Configuration

### 1. API Key Management

#### **Adding Your API Key**
1. Visit [Anthropic Console](https://console.anthropic.com/account/keys)
2. Create new API key (starts with `sk-ant-`)
3. In app, click **Settings** in header
4. Enter API key and save
5. Test with content generation

#### **API Key Security**
- **Local Storage**: Keys stored only in your browser
- **Secure Transmission**: HTTPS encryption to AI service
- **User-Specific**: Each user has their own key
- **No Server Storage**: Never stored on external servers

### 2. Account Information

#### **Profile Details**
- **Email**: Your registered email address
- **User ID**: Unique identifier for your account
- **Registration Date**: When you created your account
- **PIN Management**: Change your PIN if needed

#### **Data Management**
- **Local Storage**: All data stored in your browser
- **Privacy**: No data sent to external servers
- **Backup**: Consider manual backups of important data
- **Multi-Device**: Data doesn't sync between devices

### 3. Privacy Settings

#### **Data Handling**
- **Local Only**: All data stays on your device
- **No Analytics**: No tracking or data collection
- **User Control**: You control all your data
- **Secure Storage**: Browser's secure storage mechanisms

---

## 💡 Tips & Best Practices

### Content Creation Tips

#### **Input Quality**
- **Clear Writing**: Provide well-written original content
- **Sufficient Length**: Ensure enough content for longer versions
- **Specific Details**: Include relevant programme information
- **Proper Grammar**: Start with grammatically correct text

#### **Style Selection**
- **Match Content**: Choose style that fits your programme type
- **Consistency**: Use same style for related content
- **Custom Rules**: Create presets for recurring requirements
- **Test Variations**: Try different styles to find best fit

#### **Character Limits**
- **Realistic Limits**: Set achievable character counts
- **Platform Specific**: Tailor limits to where content will be used
- **Hierarchy**: Shorter versions should be most essential info
- **Testing**: Generate with different limits to find optimal sizes

### Advanced Usage Tips

#### **Style Presets**
- **Specific Names**: Use descriptive preset names
- **Document Rules**: Add clear descriptions to presets
- **Test Thoroughly**: Generate sample content before finalizing
- **Regular Review**: Update presets based on results

#### **Batch Processing**
- **Consistent Input**: Ensure similar content types in batches
- **Same Style**: Use consistent style across batch items
- **Quality Control**: Review results before bulk export
- **Error Handling**: Check for failed generations

#### **Excel Analysis**
- **Structured Data**: Use consistent column formats
- **Clean Content**: Remove extra spacing and formatting
- **Meaningful Comparisons**: Compare similar content types
- **Regular Analysis**: Track improvement over time

### Workflow Optimization

#### **Efficient Process**
1. **Setup**: Configure API key and create style presets
2. **Generate**: Create content with appropriate style
3. **Review**: Check all versions meet requirements
4. **Refine**: Adjust style rules if needed
5. **Export**: Save in required formats
6. **Track**: Monitor results in history

#### **Quality Assurance**
- **Multiple Styles**: Test content with different approaches
- **Peer Review**: Have colleagues review generated content
- **Style Compliance**: Use transparency features to verify rules
- **Continuous Improvement**: Refine presets based on outcomes

---

## 🔧 Troubleshooting

### Common Issues

#### **Content Generation Problems**
- **No Output**: Check API key is correctly entered
- **Mock Data**: Ensure you've added your Anthropic API key
- **Poor Quality**: Try different styles or adjust preset rules
- **Character Limits**: Content too short may not fill longer versions

#### **API Issues**
- **Invalid Key**: Verify API key format (starts with `sk-ant-`)
- **Rate Limits**: Wait a moment if hitting API limits
- **Network Errors**: Check internet connection
- **CORS Errors**: These should not occur in production

#### **Style Preset Issues**
- **Not Applying**: Ensure preset is selected before generating
- **Unexpected Results**: Use transparency features to debug
- **Rule Conflicts**: Check if rules contradict each other
- **Performance**: Complex rules may slow generation

### Technical Issues

#### **Browser Compatibility**
- **Supported**: Chrome, Firefox, Safari, Edge (latest versions)
- **Local Storage**: Ensure browser allows local storage
- **JavaScript**: Must be enabled for app to function
- **Cookies**: Not required - app uses local storage

#### **Performance Issues**
- **Slow Generation**: Check API key and internet connection
- **Large History**: Consider clearing old history items
- **Multiple Tabs**: Close unused tabs to free memory
- **Browser Cache**: Clear cache if experiencing issues

#### **Data Issues**
- **Lost Data**: Data is tied to browser and device
- **Sync Issues**: Data doesn't sync between devices
- **Backup**: No automatic backup - manual export recommended
- **Recovery**: Clear browser data resets everything

### Getting Help

#### **Error Messages**
- **API Errors**: Check browser console for specific errors
- **Generation Failures**: Verify API key and input text
- **Export Problems**: Check file download settings
- **Style Issues**: Use transparency features to debug

#### **Best Practices for Support**
- **Document Issues**: Note exact error messages
- **Check Console**: Browser developer tools show detailed errors
- **Test Minimal**: Try with simple input to isolate issues
- **Clear Data**: Sometimes clearing and restarting helps

---

## 🔒 Privacy & Security

### Data Protection

#### **Local Storage Model**
- **Your Device Only**: All data stored locally in your browser
- **No External Servers**: No databases or external storage
- **User Control**: You control all your data completely
- **Privacy First**: No tracking, analytics, or data collection

#### **API Key Security**
- **Local Storage**: Keys stored securely in your browser
- **Encrypted Transit**: HTTPS encryption to AI service
- **No Server Storage**: Keys never stored on external servers
- **User-Specific**: Each user manages their own key

### Multi-User Support

#### **Account Isolation**
- **Separate Data**: Each user sees only their own data
- **Individual Settings**: API keys and presets are per-user
- **Privacy Protection**: No data sharing between users
- **Secure Access**: PIN-based authentication per user

#### **Shared Device Use**
- **Safe for Teams**: Multiple users can use same device
- **Data Separation**: Complete isolation between accounts
- **Logout Protection**: Always log out when done
- **PIN Security**: Keep PINs confidential

### Security Best Practices

#### **API Key Management**
- **Keep Private**: Never share your API key
- **Regular Rotation**: Consider rotating keys periodically
- **Monitor Usage**: Check Anthropic console for usage
- **Secure Storage**: Browser local storage is secure

#### **Account Security**
- **Strong PIN**: Use unpredictable 4-digit PIN
- **Logout**: Always log out on shared devices
- **Browser Security**: Keep browser updated
- **HTTPS**: Always use HTTPS URLs

---

## 🎉 Conclusion

### What You've Learned

You now have comprehensive knowledge of:
- **Content Generation**: Creating professional TV metadata
- **Style Management**: Building and using custom presets
- **Advanced Features**: Batch processing, Excel analysis, transparency tools
- **Best Practices**: Optimizing your workflow and results
- **Troubleshooting**: Solving common issues independently

### Next Steps

1. **Start Creating**: Begin with simple content generation
2. **Build Presets**: Create styles for your specific needs
3. **Explore Advanced Features**: Try batch processing and Excel analysis
4. **Optimize Workflow**: Develop efficient processes
5. **Share Knowledge**: Help colleagues understand the tool

### Getting the Most Value

#### **Regular Use**
- **Daily Practice**: Use regularly to build familiarity
- **Experiment**: Try different styles and approaches
- **Feedback Loop**: Use analysis tools to improve
- **Team Adoption**: Share with colleagues for consistency

#### **Continuous Improvement**
- **Monitor Results**: Track quality and effectiveness
- **Refine Presets**: Update rules based on outcomes
- **Stay Updated**: Check for new features and improvements
- **Community**: Share tips and best practices with team

---

## 📞 Support & Resources

### Documentation
- **User Guide**: This comprehensive guide
- **Help Modal**: In-app help system
- **Feature Updates**: Regular feature announcements
- **Best Practices**: Ongoing tips and guidance

### External Resources
- **Anthropic Documentation**: [docs.anthropic.com](https://docs.anthropic.com)
- **PA TV Style Guide**: Industry standard guidelines
- **British English Resources**: Spelling and grammar guides
- **Accessibility Guidelines**: Web accessibility standards

### Community
- **Team Knowledge**: Share insights with colleagues
- **Best Practices**: Develop team standards
- **Feedback**: Provide feedback for improvements
- **Training**: Help new users get started

---

**🚀 Ready to Create Professional TV Metadata Content!**

Your Create Billings App is now ready for professional use. Start with simple content generation, then explore advanced features as you become more comfortable. The transparency features make it easy to understand and optimize your results.

**Happy Creating!** 📺✨

---

*Last Updated: January 2025*  
*Version: 2.0 - Now with Excel Analysis & Style Transparency*