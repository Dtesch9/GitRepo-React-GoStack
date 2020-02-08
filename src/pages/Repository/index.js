import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { FaRegHandPointLeft, FaSpinner } from 'react-icons/fa';
import PropTypes from 'prop-types';
import api from '../../services/api';

import Container from '../../components/Container';
import { Loading, Owner, IssuesList } from './styles';

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
  };

  async componentDidMount() {
    const { match } = this.props;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`repos/${repoName}`),
      api.get(`repos/${repoName}/issues`, {
        params: {
          state: 'open',
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

  iconTrue = () => {
    this.setState({ back: true });
  };

  iconFalse = () => {
    this.setState({ back: false });
  };

  render() {
    const { repository, issues, loading, back } = this.state;

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
      </Container>
    );
  }
}
