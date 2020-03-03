import React, {Component} from 'react';
import {
  View,
  Panel,
  ScreenSpinner,
  ConfigProvider,
  Cell,
  PanelHeaderBack,
  FixedLayout,
  Separator,
  PanelHeaderSimple,
  Group,
  Button
} from '@vkontakte/vkui';
import Icon24Camera from '@vkontakte/icons/dist/24/camera';
import Icon24Upload from '@vkontakte/icons/dist/24/upload';

import vkBridge from '@vkontakte/vk-bridge';
import '@vkontakte/vkui/dist/vkui.css';

import './App.css';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activePanel: 'main',
      history: ['main'],
      file: '',
      imagePreviewUrl: ''
    };
  }

  apiRequest = (method, params, options = {showSpinner: true}) => {
    if (options.showSpinner) {
      this.setState({popout: <ScreenSpinner/>});
    }
    return this.props.apiRequest(method, params, options).then((data) => {
      if (options.showSpinner) {
        this.setState({popout: null});
      }
      return data;
    }).catch(() => {
      if (options.showSpinner) {
        this.setState({popout: null});
      }
    });
  };

  componentDidMount() {
    vkBridge.subscribe(this.connectListener);
    this.sendBridgeRequest("VKWebAppInit");
    this.sendBridgeRequest("VKWebAppGetClientVersion");
  }

  connectListener = (e) => {
    const {type, data} = e.detail;
    switch (type) {
      case 'VKWebAppUpdateConfig':
        const {scheme, appearance, app, start_time} = data;
        const newState = {scheme, app};

        const schemeAttribute = document.createAttribute('scheme');
        schemeAttribute.value = scheme ? scheme : 'client_light';
        document.body.attributes.setNamedItem(schemeAttribute);

        if (start_time && this.state.startTime === null) {
          newState.startTime = parseInt(start_time);
        }

        this.setAppViewSettings(appearance);
        break;

      case 'VKWebAppGetClientVersionResult':
        const {version} = data;
        this.setState({clientVersion: version});
        break;


      case 'VKWebAppAccessTokenFailed':
        this.sendBridgeRequest('VKWebAppClose', {status: 'error', text: 'Доступ запрещен'});
        break;

      default:
    }
  };

  setAppViewSettings(appearance) {
    vkBridge.send('VKWebAppSetViewSettings', {
      status_bar_style: appearance === 'light' ? 'dark' : 'light',
    });
  }

  goBack = () => {
    const history = [...this.state.history];
    history.pop();
    const activePanel = history[history.length - 1];
    if (activePanel === 'main') {
      this.sendBridgeRequest('VKWebAppDisableSwipeBack');
    }
    this.setState({history, activePanel});
  };

  goForward = (activePanel) => {
    const history = [...this.state.history];
    history.push(activePanel);
    if (this.state.activePanel === 'main') {
      this.sendBridgeRequest('VKWebAppEnableSwipeBack');
    }
    this.setState({history, activePanel});
  };

  closeApp() {
    this.sendBridgeRequest('VKWebAppClose');
  }

  sendBridgeRequest(request, data) {
    console.log("[VK Bridge] Send: " + request);
    vkBridge.send(request, data).then(r => {
      console.log("[VK Bridge] response " + request);
      console.log(r)
    });
  }

  _handleSubmit(e) {
    e.preventDefault();
    // TODO: do something with -> this.state.file
    console.log('handle uploading-', this.state.file);
  }

  _handleImageChange(e) {
    e.preventDefault();

    let reader = new FileReader();
    let file = e.target.files[0];

    reader.onloadend = () => {
      this.setState({
        file: file,
        imagePreviewUrl: reader.result
      });

      this.setState({images: [this.state.file, this.state.imagePreviewUrl]})
    };

    reader.readAsDataURL(file);

    this.goForward('selfiePreview');
  }

  deleteSelfie() {
    this.goBack();
    this.setState({
      file: null,
      imagePreviewUrl: null
    });

    this.setState({images: [this.state.file, this.state.imagePreviewUrl]})
  }

  render() {
    let imagePreviewUrl = this.state.imagePreviewUrl;
    let $imagePreview = null;
    if (imagePreviewUrl) {
      $imagePreview = (<img alt="Selfie preview" src={imagePreviewUrl}/>);
    } else {
      $imagePreview = (<div className="previewText">Please select an Image for Preview</div>);
    }

    return (
      <ConfigProvider isWebView={true}>
        <View
          onSwipeBack={this.goBack}
          history={this.state.history}
          activePanel={this.state.activePanel}
          header={false}
        >
          <Panel id="main" separator={false}>
            <PanelHeaderSimple>
              Shvets-Score
            </PanelHeaderSimple>
            <Group>
              <form onSubmit={(e) => this._handleSubmit(e)}>
                <input className="fileInput"
                       type="file"
                       id="selfieInput"
                       onChange={(e) => this._handleImageChange(e)}
                       accept="image/*" capture />

                <button className="submitButton"
                        type="submit"
                        id="selfieSubmit"
                        onClick={(e) => this._handleSubmit(e)}/>

                <label htmlFor="selfieInput">
                  <Cell expandable before={<Icon24Camera/>}>
                    Сделать селфи
                  </Cell>
                </label>
              </form>

            </Group>
          </Panel>
          <Panel id="selfiePreview" separator={false}>
            <PanelHeaderSimple separator={false} left={<PanelHeaderBack onClick={() => this.deleteSelfie()}/>}>
              Shvets-Preview
            </PanelHeaderSimple>

            <div className="imgPreview">
              {$imagePreview}
            </div>

            <FixedLayout vertical="bottom">
              <Separator wide />
              <label htmlFor="selfieSubmit">
                <div className="upload_btn">
                  <Button size="xl" before={<Icon24Upload/>}>
                    Загрузить селфи
                  </Button>
                </div>
              </label>
            </FixedLayout>
          </Panel>
          <Panel id="education" separator={false}/>
        </View>
      </ConfigProvider>
    );
  }
}

export default App;
