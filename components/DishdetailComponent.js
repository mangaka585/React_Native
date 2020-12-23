import React, { Component, useRef } from 'react';
import * as Animatable from 'react-native-animatable';
import { Text, View, ScrollView, FlatList, Modal, StyleSheet, Button, Alert, PanResponder, Share } from 'react-native';
import { Card, Icon, Input } from 'react-native-elements';
import { connect } from 'react-redux';
import { baseUrl } from '../shared/baseUrl';
import { postFavorite, postComment } from '../redux/ActionCreators';
import { Rating } from 'react-native-ratings';

const mapStateToProps = state => {
    return {
      dishes: state.dishes,
      comments: state.comments,
      favorites: state.favorites
    }
}

const mapDispatchToProps = dispatch => ({
    postFavorite: (dishId) => dispatch(postFavorite(dishId)),
    postComment: (dishId, rating, author, comment) => dispatch(postComment(dishId, rating, author, comment))
})

const shareDish = (title, message, url) => {
    Share.share({
        title: title,
        message: title + ': ' + message + ' ' + url,
        url: url
    },{
        dialogTitle: 'Share ' + title
    })
}

function RenderComments(props) {

    const comments = props.comments;
            
    const renderCommentItem = ({item, index}) => {
        
        return (
            <View key={index} style={{margin: 10}}>
                <Text style={{fontSize: 14}}>{item.comment}</Text>
                <Rating imageSize={10} startingValue={item.rating} readonly='true' style={{ paddingVertical: 3, alignSelf: 'flex-start'}} />
                <Text style={{fontSize: 12}}>{'-- ' + item.author + ', ' + item.date} </Text>
            </View>
        );
    };
    
    return (
        <Animatable.View animation="fadeInUp" duration={2000} delay={1000}>
            <Card title='Comments' >
            <FlatList 
                data={comments}
                renderItem={renderCommentItem}
                keyExtractor={item => item.id.toString()}
                />
            </Card>
        </Animatable.View>
    );
}

function RenderDish(props) {

    const dish = props.dish;

    const viewRef = useRef(null)

    const recognizeDrag = ({ moveX, moveY, dx, dy }) => {
        if ( dx < -200 )
            return true;
        else
            return false;
    }

    const recognizeDragComment = ({ moveX, moveY, dx, dy }) => {
        if ( dx > 200 )
            return true;
        else
            return false;
    }

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: (e, gestureState) => {
            return true;
        },
        onPanResponderGrant: () => viewRef.current.rubberBand(1000),
        onPanResponderEnd: (e, gestureState) => {
            console.log("pan responder end", gestureState);
            if (recognizeDrag(gestureState))
                Alert.alert(
                    'Add Favorite',
                    'Are you sure you wish to add ' + dish.name + ' to favorite?',
                    [
                    {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                    {text: 'OK', onPress: () => {props.favorite ? console.log('Already favorite') : props.onPress()}},
                    ],
                    { cancelable: false }
                );
            else if(recognizeDragComment(gestureState)) props.toggleModal();
            return true;
        }
    })
    
        if (dish != null) {
            return(
                <Animatable.View animation="fadeInDown" duration={2000} delay={1000}  ref={viewRef} {...panResponder.panHandlers}>
                    <Card
                    featuredTitle={dish.name}
                    image={{uri: baseUrl + dish.image}}>
                        <Text style={{margin: 10}}>
                            {dish.description}
                        </Text>
                        <View style={styles.buttons}>
                            <Icon
                                raised
                                reverse
                                name={ props.favorite ? 'heart' : 'heart-o'}
                                type='font-awesome'
                                color='#f50'
                                onPress={() => props.favorite ? console.log('Already favorite') : props.onPress()}
                                />
                            <Icon
                                raised
                                reverse
                                name= 'pencil'
                                type='font-awesome'
                                color='#8A2BE2'
                                onPress={() => props.toggleModal()}
                                />
                            <Icon
                                raised
                                reverse
                                name='share'
                                type='font-awesome'
                                color='#51D2A8'
                                style={styles.cardItem}
                                onPress={() => shareDish(dish.name, dish.description, baseUrl + dish.image)} 
                                />
                        </View>
                    </Card>
                </Animatable.View>
            );
        } 
        else {
            return(<View></View>);
        }
}

class  Dishdetail extends Component {

    constructor(props){
        super(props);
        this.state = {
            author: '',
            comment: '',
            rating: 0,
            showModal: false
        }
    }

    static navigationOptions = {
        title: 'Dish Details'
    }

    markFavorite(dishId) {
        this.props.postFavorite(dishId);
    }

    toggleModal() {
        this.setState({showModal: !this.state.showModal});
    }

    resetForm() {
        this.setState({
            showModal: false
        });
    }

    postCommentFunc(dishId, rating, author, comment){
        this.props.postComment(dishId, rating, author, comment);
    }

    render() {
        const dishId = this.props.navigation.getParam('dishId', '');

        return(
            <ScrollView>
                <RenderDish dish={this.props.dishes.dishes[+dishId]}
                    favorite={this.props.favorites.some(el => el === dishId)}
                    onPress={() => this.markFavorite(dishId)}
                    toggleModal={() => this.toggleModal()}
                    />
                <RenderComments comments={this.props.comments.comments.filter((comment) => comment.dishId === dishId)} />
                <Modal animationType = {"slide"} transparent = {false}
                    visible = {this.state.showModal}
                    onDismiss = {() => this.toggleModal() }
                    onRequestClose = {() => this.toggleModal() }>
                    <View style = {styles.modal}>

                        <Rating
                            showRating
                            onFinishRating={(rating) => this.setState({rating: rating})}
                            style={{ paddingVertical: 10 }}
                        />

                        <Input
                            placeholder=' Author'
                            onChangeText={(text) => {this.setState({author: text})}}
                            leftIcon={
                            <Icon
                                name='user'
                                size={20}
                                color='gray'
                                type='font-awesome'
                            />
                            }
                        />
                        <Input
                            placeholder=' Comment'
                            onChangeText={(text) => {this.setState({comment: text})}}
                            leftIcon={
                            <Icon
                                name='comment'
                                size={20}
                                color='gray'
                                type='font-awesome'
                            />
                            }
                        />
                        <View style={{marginVertical:20}}>
                            <Button 
                                onPress = {() => { this.postCommentFunc(dishId, this.state.rating, this.state.author, this.state.comment); this.resetForm(); this.toggleModal() }}
                                color="#512DA8"
                                title="Submit" 
                                />
                        </View>
                        <Button 
                            onPress = {() => {this.toggleModal() }}
                            color="gray"
                            title="Close" 
                            />
                    </View>
                </Modal>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    buttons: {
        flexDirection: 'row',
        justifyContent: 'center'
    },
    modal: {
        justifyContent: 'center',
        margin: 20
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(Dishdetail);