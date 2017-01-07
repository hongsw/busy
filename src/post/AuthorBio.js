import React, { Component } from 'react';
import steemdb from 'steemdb';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Avatar from '../widgets/Avatar';
import Loading from '../widgets/Loading';
import Follow from '../widgets/Follow';
import { followUser, unfollowUser, getFollowing } from '../user/userActions';

@connect(
  ({ auth, userProfile }) => ({ auth, following: userProfile.following }),
  dispatch => bindActionCreators({ followUser, unfollowUser, getFollowing }, dispatch)
)
class AuthorBio extends Component {
  constructor(props) {
    super(props);
    this.state = {
      author: null,
    };
  }

  componentDidMount() {
    const loggedInUser = this.props.auth.user.name;
    this.props.getFollowing(loggedInUser);
    steemdb.accounts({
      account: this.props.authorName
    }, (err, result) => {
      if (result.length) {
        const author = result[0];

        try {
          author.json_metadata = JSON.parse(result[0].json_metadata);
        } catch (e) {
          author.json_metadata = {};
        }
        this.setState({ author });
      }
    });
  }

  render() {
    const { authorName, auth, following } = this.props;
    const { author } = this.state;
    const loggedInUser = auth.user.name;

    if (author && !following.isFetching) {
      const isFollowing = following.list.indexOf(authorName) >= 0;
      const { about, name } = author.json_metadata.profile || {};
      const displayName = name || `@${authorName}`;
      const onClickFollowFn = isFollowing ? this.props.unfollowUser : this.props.followUser;

      return (
        <div className="col-md-4">
          <div>
            <Avatar lg username={authorName} />
            <span>{displayName}</span>
            <Follow
              hasFollow={authorName !== loggedInUser}
              isFollowing={isFollowing}
              onClickFollow={() => onClickFollowFn(authorName)}
            />
          </div>
          <div>{about}</div>
        </div>
      );
    }

    return <Loading />;
  }
}

export default AuthorBio;
