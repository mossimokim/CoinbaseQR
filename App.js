import React, {Component} from 'react';
import {
    UIManager, LayoutAnimation, Alert, View, TextInput, StyleSheet, Text,
    NavigatorIOS,
    TouchableOpacity,
    Linking,
} from 'react-native';
import {authorize, refresh, revoke} from 'react-native-app-auth';
import QRCode from 'react-native-qrcode';
import QRCodeScanner from 'react-native-qrcode-scanner';

import {Page, Button, ButtonContainer, Form, Heading} from './components';

UIManager.setLayoutAnimationEnabledExperimental &&
UIManager.setLayoutAnimationEnabledExperimental(true);

type State = {
    hasLoggedInOnce: boolean,
    accessToken: ?string,
    accessTokenExpirationDate: ?string,
    refreshToken: ?string,
    userInfo: [],
    address: [],
    balance: [],
    qrCode: ?string
};

const config = {
    clientId: 'your Coinbase api client id',
    clientSecret: 'your Coinbase api client secret',
    redirectUrl: 'com.yourapp.auth://redirect',
    scopes: ['wallet:accounts:read', 'wallet:accounts:update', 'wallet:addresses:read'],
    serviceConfiguration: {
        authorizationEndpoint: 'https://www.coinbase.com/oauth/authorize',
        tokenEndpoint: 'https://api.coinbase.com/oauth/token',
        revocationEndpoint: 'https://api.coinbase.com/oauth/revoke'
    }
};

export default class App extends Component<{}, State> {
    state = {
        hasLoggedInOnce: false,
        accessToken: '',
        accessTokenExpirationDate: '',
        refreshToken: ''
    };

    animateState(nextState: $Shape<State>, delay: number = 0) {
        setTimeout(() => {
            this.setState(() => {
                LayoutAnimation.easeInEaseOut();
                return nextState;
            });
        }, delay);
    }

    onSuccess(e) {
        this.state.qrCode = e.data;
    }

    authorize = async () => {
        try {
            const authState = await authorize(config);

            this.animateState(
                {
                    hasLoggedInOnce: true,
                    accessToken: authState.accessToken,
                    accessTokenExpirationDate: authState.accessTokenExpirationDate,
                    refreshToken: authState.refreshToken
                },
                600
            );
            //TODO tidy up API calls
            fetch('https://api.coinbase.com/v2/user/', {
                headers: {
                    'Authorization': `Bearer ${authState.accessToken}`
                }
            }).then(response => response.json())
                .then(data => {
                    this.animateState({userInfo: data});
                })
                .catch(error => console.error(error));

            //callback madness
            fetch('https://api.coinbase.com/v2/accounts', {
                headers: {
                    'Authorization': `Bearer ${authState.accessToken}`
                }
            }).then(response => response.json())
                .then(data => {
                    this.animateState({balance: data});
                    fetch('https://api.coinbase.com/v2/accounts/' + data.data[0].id + '/addresses', {
                        headers: {
                            'Authorization': `Bearer ${authState.accessToken}`
                        }
                    }).then(response => response.json())
                        .then(data => {
                            this.animateState({address: data})
                        })
                        .catch(error => console.error(error));
                })
                .catch(error => console.error(error));

        } catch (error) {
            Alert.alert('Failed to log in', error.message);
        }
    };

    send = async () => {
        //transaction API call
    };

    revoke = async () => {
        try {
            await revoke(config, {
                tokenToRevoke: this.state.accessToken,
                sendClientId: true
            });
            this.animateState({
                accessToken: '',
                accessTokenExpirationDate: '',
                refreshToken: ''
            });
        } catch (error) {
            Alert.alert('Failed to sign out.', error.message);
        }
    };

    render() {
        const {state} = this;
        return (
            <Page>
                {!!state.accessToken ? (
                    <Form>
                        <Form.Label>Name</Form.Label>
                        <Form.Value>{state.userInfo.data.name}</Form.Value>
                        <Form.Label>{state.balance.data[0].balance.currency} Balance</Form.Label>
                        <Form.Value>{state.balance.data[0].balance.amount}</Form.Value>
                        <Form.Label>{state.balance.data[0].balance.currency} Address</Form.Label>
                        <Form.Value>{state.address.data[0].address}</Form.Value>
                        <View style={styles.container}>
                            <QRCode
                                value={state.address.data[0].address}
                                size={200}
                                bgColor='black'
                                fgColor='white'/>
                        </View>
                        {/*<NavigatorIOS*/}
                        {/*initialRoute={{*/}
                        {/*component: QRCodeScanner,*/}
                        {/*title: 'Scan Code',*/}
                        {/*passProps: {*/}
                        {/*onRead:this.onSuccess.bind(this),*/}
                        {/*bottomContent: (*/}
                        {/*<TouchableOpacity style={styles.buttonTouchable}>*/}
                        {/*<Text style={styles.buttonText}>Cancel</Text>*/}
                        {/*</TouchableOpacity>*/}
                        {/*),*/}
                        {/*},*/}
                        {/*}}*/}
                        {/*style={{ flex: 1 }}*/}
                        {/*/>*/}
                    </Form>
                ) : (
                    <Heading>{state.hasLoggedInOnce ? 'Goodbye.' : 'Coinbase QR Wallet'}</Heading>
                )}

                <ButtonContainer>
                    {!state.accessToken && (
                        <Button onPress={this.authorize} text="Sign in to Coinbase" color="#4169e1"/>
                    )}
                    {!!state.refreshToken &&
                    <Button onPress={this.send} text={"Send " + state.balance.data[0].balance.currency}
                            color="#3c3c3d"/>}
                    {!!state.accessToken && <Button onPress={this.revoke} text="Sign Out" color="#EF525B"/>}
                </ButtonContainer>
            </Page>
        );
    }

}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center'
    },

    input: {
        width: 20,
        height: 20,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 20,
        marginTop: 0,
        borderRadius: 5,
        padding: 5
    },
    centerText: {
        flex: 1,
        fontSize: 18,
        padding: 32,
        color: '#777',
    },

    textBold: {
        fontWeight: '500',
        color: '#000',
    },

    buttonText: {
        fontSize: 21,
        color: 'rgb(0,122,255)',
    },

    buttonTouchable: {
        padding: 16,
    },
});
