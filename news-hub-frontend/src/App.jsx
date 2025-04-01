import { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  TextField, 
  Button, 
  Card, 
  CardContent, 
  Box, 
  CircularProgress,
  IconButton,
  CardMedia,
  CardActions,
  Paper,
  InputAdornment,
  Divider,
  Chip,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Search as SearchIcon,
  Summarize as SummarizeIcon,
  Article as ArticleIcon,
  Language as LanguageIcon,
  Newspaper as NewspaperIcon,
  LocationOn as LocationIcon,
  Publish as PublishIcon
} from '@mui/icons-material';
import axios from 'axios';

function App() {
  const [searchTopic, setSearchTopic] = useState('');
  const [location, setLocation] = useState('');
  const [language, setLanguage] = useState('en');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [languages, setLanguages] = useState({});
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch available languages on component mount
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await axios.get('http://localhost:8001/api/languages');
        setLanguages(response.data);
      } catch (err) {
        console.error('Error fetching languages:', err);
      }
    };
    fetchLanguages();
  }, []);

  const searchNews = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.post('http://localhost:8001/api/search', {
        topic: searchTopic,
        location,
        language
      });
      setArticles(response.data.articles);
    } catch (err) {
      setError('Error fetching news. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateSummary = async (article) => {
    try {
      const response = await axios.post('http://localhost:8001/api/summarize', article);
      setArticles(articles.map(a => 
        a.url === article.url 
          ? { ...a, summary: response.data.summary }
          : a
      ));
      setSnackbar({
        open: true,
        message: 'Summary generated successfully!',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error generating summary:', err);
      setSnackbar({
        open: true,
        message: 'Error generating summary. Please try again.',
        severity: 'error'
      });
    }
  };

  const publishToHashnode = async () => {
    if (!selectedArticle) return;

    try {
      const response = await axios.post('http://localhost:8001/api/publish', {
        title: selectedArticle.title,
        content: selectedArticle.summary || selectedArticle.text,
        tags: ['news', 'ai-generated']
      });

      setSnackbar({
        open: true,
        message: 'Article published successfully!',
        severity: 'success'
      });
      setPublishDialogOpen(false);
    } catch (err) {
      console.error('Error publishing to Hashnode:', err);
      setSnackbar({
        open: true,
        message: 'Error publishing to Hashnode. Please try again.',
        severity: 'error'
      });
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Navigation Bar */}
      <AppBar position="fixed" sx={{ backgroundColor: '#1a237e' }}>
        <Toolbar>
          <NewspaperIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            AI News Hub
          </Typography>
          <FormControl variant="standard" sx={{ minWidth: 120, mr: 2 }}>
            <Select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              sx={{ color: 'white' }}
            >
              {Object.entries(languages).map(([code, name]) => (
                <MenuItem key={code} value={code}>{name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: 10, mb: 4 }}>
        {/* Search Section */}
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            mb: 4, 
            backgroundColor: '#f5f5f5',
            borderRadius: 2
          }}
        >
          <Typography variant="h4" gutterBottom align="center" color="primary">
            Discover AI-Powered News
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                variant="outlined"
                label="Search Topic"
                value={searchTopic}
                onChange={(e) => setSearchTopic(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchNews()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                variant="outlined"
                label="Location (Optional)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Button 
              variant="contained" 
              onClick={searchNews}
              disabled={loading || !searchTopic}
              startIcon={<SearchIcon />}
              sx={{ 
                alignSelf: 'center',
                minWidth: '200px',
                backgroundColor: '#1a237e',
                '&:hover': {
                  backgroundColor: '#000051'
                }
              }}
            >
              Search News
            </Button>
          </Box>
        </Paper>

        {/* Loading and Error States */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress size={40} />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        )}

        {/* Articles Grid */}
        <Box sx={{ 
          display: 'grid', 
          gap: 3,
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'
        }}>
          {articles.map((article, index) => (
            <Card 
              key={index} 
              elevation={2}
              sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                height: '100%',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)'
                }
              }}
            >
              {article.image_url && (
                <CardMedia
                  component="img"
                  height="140"
                  image={article.image_url}
                  alt={article.title}
                  sx={{ objectFit: 'cover' }}
                />
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {article.title}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip 
                    icon={<ArticleIcon />} 
                    label={article.source}
                    size="small"
                  />
                  {article.publish_date && (
                    <Chip 
                      label={new Date(article.publish_date).toLocaleDateString()}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  {article.text.slice(0, 200)}...
                </Typography>

                {article.summary && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" gutterBottom>
                      AI Summary:
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {article.summary}
                    </Typography>
                  </>
                )}
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {!article.summary && (
                    <Button 
                      startIcon={<SummarizeIcon />}
                      variant="outlined" 
                      onClick={() => generateSummary(article)}
                      size="small"
                    >
                      Generate Summary
                    </Button>
                  )}
                  <Button 
                    href={article.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    endIcon={<ArticleIcon />}
                    size="small"
                  >
                    Read Full
                  </Button>
                </Box>
                {article.summary && (
                  <Button
                    startIcon={<PublishIcon />}
                    variant="contained"
                    size="small"
                    onClick={() => {
                      setSelectedArticle(article);
                      setPublishDialogOpen(true);
                    }}
                    color="secondary"
                  >
                    Publish
                  </Button>
                )}
              </CardActions>
            </Card>
          ))}
        </Box>
      </Container>

      {/* Publish Dialog */}
      <Dialog open={publishDialogOpen} onClose={() => setPublishDialogOpen(false)}>
        <DialogTitle>Publish to Hashnode</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to publish this article to Hashnode?
          </Typography>
          {selectedArticle && (
            <>
              <Typography variant="subtitle1" gutterBottom>
                Title: {selectedArticle.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Summary: {selectedArticle.summary}
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPublishDialogOpen(false)}>Cancel</Button>
          <Button onClick={publishToHashnode} variant="contained" color="primary">
            Publish
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default App;
