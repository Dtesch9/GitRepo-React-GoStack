import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { FaRegHandPointLeft, FaSpinner } from 'react-icons/fa';
import PropTypes from 'prop-types';
import api from '../../services/api';

import Container from '../../components/Container';
import Buttons from '../../components/Button';
import { Loading, Owner, IssuesList, Filter, Button } from './styles';

export default class Repository extends Component {
  // eslint-disable-next-line react/static-property-placement
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
    back: true,
    issueFilter: 'all',
    issuePage: 1,
  };

  async componentDidMount() {
    const { match } = this.props;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`repos/${repoName}`),
      api.get(`repos/${repoName}/issues`, {
        params: {
          state: 'all',
          per_page: 5,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  async componentDidUpdate(_, prevState) {
    const { issueFilter: oldState, issuePage: oldPage } = prevState;
    const { issueFilter: newState, issuePage: currentPage } = this.state;

    if (oldState !== newState || oldPage !== currentPage) {
      this.setIssueState();
    }
  }

  async setIssueState() {
    const { issueFilter: newState, issuePage } = this.state;
    const { match } = this.props;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`repos/${repoName}`),
      api.get(`repos/${repoName}/issues`, {
        params: {
          state: `${newState}`,
          per_page: 5,
          page: `${issuePage}`,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
    });
  }

  handlePages = e => {
    const { issuePage: pageNumber } = this.state;
    const page = e.target.innerHTML;

    if (page === 'Prev') {
      this.setState({ issuePage: pageNumber - 1 });
    } else {
      this.setState({ issuePage: pageNumber + 1 });
    }
  };

  handleIssueState = e => {
    const { value } = e.target;

    this.setState({ issueFilter: value.toLowerCase() });
  };

  iconTrue = () => {
    this.setState({ back: true });
  };

  iconFalse = () => {
    this.setState({ back: false });
  };

  render() {
    const { repository, issues, loading, back, issuePage } = this.state;

    if (loading) {
      return (
        <Loading>
          <FaSpinner />
        </Loading>
      );
    }

    return (
      <Container>
        <Owner icon={back}>
          <Link
            to="/"
            className="button"
            onMouseEnter={this.iconFalse}
            onMouseLeave={this.iconTrue}
          >
            {back ? 'voltar' : <FaRegHandPointLeft />}
          </Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>

        <Filter onClick={this.handleIssueState}>
          <option value="All">Todas</option>
          <option value="Open">Abertas</option>
          <option value="Closed">Fechadas</option>
        </Filter>

        <IssuesList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssuesList>

        <Buttons>
          <Button
            type="button"
            pageOne={issuePage === 1}
            onClick={this.handlePages}
          >
            Prev
          </Button>
          <Button type="button" onClick={this.handlePages}>
            next
          </Button>
        </Buttons>
      </Container>
    );
  }
}
