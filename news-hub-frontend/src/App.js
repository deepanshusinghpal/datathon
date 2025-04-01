import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import PublishIcon from '@mui/icons-material/Publish';
import axios from 'axios';

// Styled components
const StyledHeader = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1a237e, #0d47a1)',
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(4),
  color: 'white',
  textAlign: 'center',
}));

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  width: '100%',
}));

function App() {
  const [topic, setTopic] = useState('');
  const [location, setLocation] = useState('');
  const [language, setLanguage] = useState('en');
  const [articles, setArticles] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const languages = {
    en: "English 🇬🇧",
    es: "Spanish 🇪🇸",
    fr: "French 🇫🇷",
    de: "German 🇩🇪",
    it: "Italian 🇮🇹",
    pt: "Portuguese 🇵🇹",
    ru: "Russian 🇷🇺",
    zh: "Chinese 🇨🇳",
    ja: "Japanese 🇯🇵",
    ko: "Korean 🇰🇷"
  };

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:8000/api/search', {
        topic,
        location,
        language
      });
      setArticles(response.data.articles);
    } catch (err) {
      setError('Failed to fetch articles. Please try again.');
    }
    setLoading(false);
  };

  const handleGenerateSummary = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/summarize', {
        articles
      });
      setSummaries(response.data.summaries);
    } catch (err) {
      setError('Failed to generate summaries. Please try again.');
    }
    setLoading(false);
  };

  const handlePublish = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/publish', {
        articles,
        summaries,
        topic,
        location,
        language
      });
      if (response.data.url) {
        window.open(response.data.url, '_blank');
      }
    } catch (err) {
      setError('Failed to publish article. Please try again.');
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="lg">
      <StyledHeader>
        <Typography variant="h3" gutterBottom>
          📰 AI News Hub
        </Typography>
        <Typography variant="h6">
          Discover, Summarize, and Share News with AI
        </Typography>
      </StyledHeader>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Box mb={4}>
            <TextField
              fullWidth
              label="Enter your news topic"
              variant="outlined"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., AI, Climate Change, Technology"
            />
            <Box mt={2}>
              <TextField
                fullWidth
                label="Location (Optional)"
                variant="outlined"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., New York, London, Tokyo"
              />
            </Box>
            <ActionButton
              variant="contained"
              color="primary"
              onClick={handleSearch}
              disabled={loading || !topic}
              startIcon={<SearchIcon />}
            >
              Search News
            </ActionButton>
          </Box>

          {loading && (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Typography color="error" gutterBottom>
              {error}
            </Typography>
          )}

          {articles.map((article, index) => (
            <StyledCard key={index}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {article.title}
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  {article.text.substring(0, 300)}...
                </Typography>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="textSecondary">
                    {article.source} • {article.publish_date}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    href={article.url}
                    target="_blank"
                  >
                    Read More
                  </Button>
                </Box>
              </CardContent>
            </StyledCard>
          ))}
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ⚙️ Settings
              </Typography>
              <FormControl fullWidth variant="outlined" margin="normal">
                <InputLabel>Language</InputLabel>
                <Select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  label="Language"
                >
                  {Object.entries(languages).map(([code, name]) => (
                    <MenuItem key={code} value={code}>
                      {name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {articles.length > 0 && (
                <>
                  <ActionButton
                    variant="contained"
                    color="secondary"
                    onClick={handleGenerateSummary}
                    disabled={loading}
                    startIcon={<AutoStoriesIcon />}
                  >
                    Generate Summary
                  </ActionButton>

                  <ActionButton
                    variant="contained"
                    color="success"
                    onClick={handlePublish}
                    disabled={loading}
                    startIcon={<PublishIcon />}
                  >
                    Publish to Hashnode
                  </ActionButton>
                </>
              )}
            </CardContent>
          </Card>

          {summaries.length > 0 && (
            <Box mt={2}>
              <Typography variant="h6" gutterBottom>
                📋 Summaries
              </Typography>
              {summaries.map((summary, index) => (
                <StyledCard key={index}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Article {index + 1}
                    </Typography>
                    <Typography variant="body2">
                      {summary}
                    </Typography>
                  </CardContent>
                </StyledCard>
              ))}
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}

export default App; 