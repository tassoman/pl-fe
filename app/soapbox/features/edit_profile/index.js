import React from 'react';
import { connect } from 'react-redux';
import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';
import ImmutablePureComponent from 'react-immutable-pure-component';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { showAlert } from 'soapbox/actions/alerts';
import Column from '../ui/components/column';
import {
  SimpleForm,
  FieldsGroup,
  TextInput,
  Checkbox,
  FileChooser,
  SimpleTextarea,
} from 'soapbox/features/forms';
import ProfilePreview from './components/profile_preview';
import {
  Map as ImmutableMap,
  List as ImmutableList,
} from 'immutable';
import { patchMe } from 'soapbox/actions/me';
import { unescape } from 'lodash';

const messages = defineMessages({
  heading: { id: 'column.edit_profile', defaultMessage: 'Edit profile' },
  metaFieldLabel: { id: 'edit_profile.fields.meta_fields.label_placeholder', defaultMessage: 'Label' },
  metaFieldContent: { id: 'edit_profile.fields.meta_fields.content_placeholder', defaultMessage: 'Content' },
  verified: { id: 'edit_profile.fields.verified_display_name', defaultMessage: 'Verified users may not update their display name' },
});

const mapStateToProps = state => {
  const me = state.get('me');
  return {
    account: state.getIn(['accounts', me]),
    maxFields: state.getIn(['instance', 'pleroma', 'metadata', 'fields_limits', 'max_fields'], 4),
  };
};

// Forces fields to be maxFields size, filling empty values
const normalizeFields = (fields, maxFields) => (
  ImmutableList(fields).setSize(maxFields).map(field =>
    field ? field : ImmutableMap({ name: '', value: '' })
  )
);

// HTML unescape for special chars, eg <br>
const unescapeParams = (map, params) => (
  params.reduce((map, param) => (
    map.set(param, unescape(map.get(param)))
  ), map)
);

export default @connect(mapStateToProps)
@injectIntl
class EditProfile extends ImmutablePureComponent {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
    account: ImmutablePropTypes.map,
    maxFields: PropTypes.number,
  };

  state = {
    isLoading: false,
  }

  constructor(props) {
    super(props);
    const initialState = props.account.withMutations(map => {
      map.merge(map.get('source'));
      map.delete('source');
      map.set('fields', normalizeFields(map.get('fields'), props.maxFields));
      unescapeParams(map, ['display_name', 'bio']);
    });
    this.state = initialState.toObject();
  }

  makePreviewAccount = () => {
    const { account } = this.props;
    return account.merge(ImmutableMap({
      header: this.state.header,
      avatar: this.state.avatar,
      display_name: this.state.display_name,
    }));
  }

  getFieldParams = () => {
    let params = ImmutableMap();
    this.state.fields.forEach((f, i) =>
      params = params
        .set(`fields_attributes[${i}][name]`,  f.get('name'))
        .set(`fields_attributes[${i}][value]`, f.get('value'))
    );
    return params;
  }

  getParams = () => {
    const { state } = this;
    return Object.assign({
      discoverable: state.discoverable,
      bot: state.bot,
      display_name: state.display_name,
      note: state.note,
      avatar: state.avatar_file,
      header: state.header_file,
      locked: state.locked,
    }, this.getFieldParams().toJS());
  }

  getFormdata = () => {
    const data = this.getParams();
    let formData = new FormData();
    for (let key in data) {
      // Compact the submission. This should probably be done better.
      const shouldAppend = Boolean(data[key] || key.startsWith('fields_attributes'));
      if (shouldAppend) formData.append(key, data[key] || '');
    }
    return formData;
  }

  handleSubmit = (event) => {
    const { dispatch } = this.props;
    dispatch(patchMe(this.getFormdata())).then(() => {
      this.setState({ isLoading: false });
      dispatch(showAlert('', 'Profile saved!'));
    }).catch((error) => {
      this.setState({ isLoading: false });
    });
    this.setState({ isLoading: true });
    event.preventDefault();
  }

  handleCheckboxChange = e => {
    this.setState({ [e.target.name]: e.target.checked });
  }

  handleTextChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  }

  handleFieldChange = (i, key) => {
    return (e) => {
      this.setState({
        fields: this.state.fields.setIn([i, key], e.target.value),
      });
    };
  }

  handleFileChange = e => {
    const { name } = e.target;
    const [file] = e.target.files || [];
    const url = file ? URL.createObjectURL(file) : this.state[name];

    this.setState({
      [name]: url,
      [`${name}_file`]: file,
    });
  }

  render() {
    const { intl, maxFields, account } = this.props;
    const verified = account.getIn(['pleroma', 'tags'], ImmutableList()).includes('verified');

    return (
      <Column icon='user' heading={intl.formatMessage(messages.heading)} backBtnSlim>
        <SimpleForm onSubmit={this.handleSubmit}>
          <fieldset disabled={this.state.isLoading}>
            <FieldsGroup>
              <TextInput
                className={verified ? 'disabled' : ''}
                label={<FormattedMessage id='edit_profile.fields.display_name_label' defaultMessage='Display name' />}
                name='display_name'
                value={this.state.display_name}
                onChange={this.handleTextChange}
                disabled={verified}
                hint={verified && intl.formatMessage(messages.verified)}
              />
              <SimpleTextarea
                label={<FormattedMessage id='edit_profile.fields.bio_label' defaultMessage='Bio' />}
                name='note'
                autoComplete='off'
                value={this.state.note}
                wrap='hard'
                onChange={this.handleTextChange}
                rows={3}
              />
              <div className='fields-row'>
                <div className='fields-row__column fields-row__column-6'>
                  <ProfilePreview account={this.makePreviewAccount()} />
                </div>
                <div className='fields-row__column fields-group fields-row__column-6'>
                  <FileChooser
                    label={<FormattedMessage id='edit_profile.fields.header_label' defaultMessage='Header' />}
                    name='header'
                    hint={<FormattedMessage id='edit_profile.hints.header' defaultMessage='PNG, GIF or JPG. At most 2 MB. Will be downscaled to 1500x500px' />}
                    onChange={this.handleFileChange}
                  />
                  <FileChooser
                    label={<FormattedMessage id='edit_profile.fields.avatar_label' defaultMessage='Avatar' />}
                    name='avatar'
                    hint={<FormattedMessage id='edit_profile.hints.avatar' defaultMessage='PNG, GIF or JPG. At most 2 MB. Will be downscaled to 400x400px' />}
                    onChange={this.handleFileChange}
                  />
                </div>
              </div>
              <Checkbox
                label={<FormattedMessage id='edit_profile.fields.locked_label' defaultMessage='Lock account' />}
                hint={<FormattedMessage id='edit_profile.hints.locked' defaultMessage='Requires you to manually approve followers' />}
                name='locked'
                checked={this.state.locked}
                onChange={this.handleCheckboxChange}
              />
              <Checkbox
                label={<FormattedMessage id='edit_profile.fields.bot_label' defaultMessage='This is a bot account' />}
                hint={<FormattedMessage id='edit_profile.hints.bot' defaultMessage='This account mainly performs automated actions and might not be monitored' />}
                name='bot'
                checked={this.state.bot}
                onChange={this.handleCheckboxChange}
              />
            </FieldsGroup>
            <FieldsGroup>
              <div className='fields-row__column fields-group'>
                <div className='input with_block_label'>
                  <label><FormattedMessage id='edit_profile.fields.meta_fields_label' defaultMessage='Profile metadata' /></label>
                  <span className='hint'>
                    <FormattedMessage id='edit_profile.hints.meta_fields' defaultMessage='You can have up to {count, plural, one {# item} other {# items}} displayed as a table on your profile' values={{ count: maxFields }} />
                  </span>
                  {
                    this.state.fields.map((field, i) => (
                      <div className='row' key={i}>
                        <TextInput
                          placeholder={intl.formatMessage(messages.metaFieldLabel)}
                          value={field.get('name')}
                          onChange={this.handleFieldChange(i, 'name')}
                        />
                        <TextInput
                          placeholder={intl.formatMessage(messages.metaFieldContent)}
                          value={field.get('value')}
                          onChange={this.handleFieldChange(i, 'value')}
                        />
                      </div>
                    ))
                  }
                </div>
              </div>
            </FieldsGroup>
          </fieldset>
          <div className='actions'>
            <button name='button' type='submit' className='btn button button-primary'>
              <FormattedMessage id='edit_profile.save' defaultMessage='Save' />
            </button>
          </div>
        </SimpleForm>
      </Column>
    );
  }

}
