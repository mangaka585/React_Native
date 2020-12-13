import React, { Component } from 'react';
import { Text, View, StyleSheet, ScrollView, FlatList, Modal, Button, TextInput } from 'react-native';
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

function RenderComments(props) {

    const comments = props.comments;
            
    const renderCommentItem = ({item, index}) => {
        
        let normalDate = item.date.format("YYYY-MM-DDTHH:mm:ss.SSSZZ");
        
        return (
            <View key={index} style={{margin: 10}}>
                <Text style={{fontSize: 14}}>{item.comment}</Text>
                <Rating imageSize={10} startingValue={item.rating} readonly='true' style={{ paddingVertical: 3, alignSelf: 'flex-start'}} />
                <Text style={{fontSize: 12}}>{'-- ' + item.author + ', ' + normalDate} </Text>
            </View>
        );
    };
    
    return (
        <Card title='Comments' >
        <FlatList 
            data={comments}
            renderItem={renderCommentItem}
            keyExtractor={item => item.id.toString()}
            />
        </Card>
    );
}

function RenderDish(props) {

    const dish = props.dish;
    
        if (dish != null) {
            return(
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
                    </View>
                </Card>
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