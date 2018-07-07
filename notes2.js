var TaskEditor = React.createClass({
    getInitialState: function(){
        return {
            text: '',
            isDone: false,
            id: Date.now()
        };
    },

    hendlerTextChange: function(event){
        if (this.isEnter){
            this.setState({text: '' });
        }
        else if(event.target.value.length<60){
            this.setState({text: event.target.value });            
        }
    },

    hendlerPressKey: function(event){
        if (event.key === 'Enter'){
            this.hendlerTaskAdd(event.target.value);
            this.isEnter = true;
        }
        else{
            this.isEnter = false;
        }
    },

    hendlerTaskAdd: function(text){
        var newTask = {
            text: text,
            isDone: false,
            id: Date.now()
        };

        this.props.onTaskAdd(newTask);  
    },

    render: function() {
        return(
            <div className="note-editor">
                <textarea 
                    placeholder="Tape task here..." 
                    rows={1}                                         
                    className="textarea"
                    value={this.state.text}
                    onChange={this.hendlerTextChange}
                    onKeyPress={this.hendlerPressKey}
                    />
            </div>
        );
    }
});

var TasksGrid = React.createClass({
    render: function() {
        var onTaskDelete = this.props.onTaskDelete;
        var onTaskDone = this.props.onTaskDone;
        return (            
            <div className="notes-grid">
                {
                    this.props.tasks.map(task =>{
                        return (
                            <Task 
                                key={task.id} 
                                isDone={task.isDone}
                                onDelete={onTaskDelete.bind(null,task)}
                                onDone={onTaskDone.bind(null,task)}
                                >{task.text}</Task>
                        );
                    })
                }
            </div>
        );
    }
});

var Task = React.createClass({
    render: function() {
        var style = this.props.isDone ? {textDecoration: "line-through"} : null;
        return (            
            <div className="task">
                <input type="checkbox" checked={this.props.isDone} onChange={this.props.onDone}></input>
                <div style = {style}>{this.props.children}</div> 
                <span className="delete-task" onClick={this.props.onDelete}>x</span>                 
            </div>
        );
    }
});

var Filters = React.createClass({
    render(){
        const filters_buttons = [
            {key : 'all', text : 'All'},
            {key : 'active', text : 'Active'},
            {key : 'completed', text : 'Completed'}
        ];

        var onFilterChange = this.props.onFilterChange;
        
        return (
            <div className='filters-todo'>
                {
                filters_buttons.map(filter => 
                    <span 
                        className={(filter.key == this.props.currentFilter)?('active'):('')}
                        key={filter.key}
                        onClick={onFilterChange.bind(null,filter)}
                    >{filter.text}
                    </span>)
                }
            </div>
        );
    }
});

var ToDoListApp = React.createClass({
    getInitialState: function(){
        return{
            tasks: [],
            filter: 'all'
        };
    },

    componentDidMount: function(prevProps){
        var localTasks = JSON.parse(localStorage.getItem('tasks'));
        if(localTasks){
            this.setState({tasks: localTasks});
        }
    },

    hendlerTaskAdd: function(newTask){
        var newTasks = this.state.tasks.slice();
        newTasks.unshift(newTask);        
        this.setState({tasks: newTasks});
    },

    hendlerTaskDone: function(task){
        var idTask = task.id;
        task.isDone = !task.isDone;
        var newTasks = this.state.tasks.filter(t => t.id != idTask);
        newTasks.unshift(task);  
        newTasks.sort(function(a, b) {
            return b.id - a.id;});      
        this.setState({tasks: newTasks});
    },
    
    hendlerTaskDelete: function(task){
        var idTask = task.id;
        var newTasks = this.state.tasks.filter(t => t.id != idTask);
        this.setState({tasks: newTasks});
    },

    hendleFilterChange: function(newFilter){
        this.setState({filter : newFilter.key});
    },

    getFiltredTask: function(tasks, filter)
    {
        if(filter == 'all'){
            return this.state.tasks;
        }
        else if (filter == 'active'){
            return this.state.tasks.filter(t => !t.isDone);
        }
        else{
            return this.state.tasks.filter(t => t.isDone);
        }
    },

    componentDidUpdate: function(){
        this._updateLocalStorage();
    },

    render: function(){
        var filtredTasks = this.getFiltredTask(this.state.tasks, this.state.filter);

        return (
            <div className="notes-app">
                <TaskEditor onTaskAdd={this.hendlerTaskAdd}/>                
                <Filters 
                    currentFilter={this.state.filter}
                    onFilterChange={this.hendleFilterChange}
                    />
                <TasksGrid 
                    tasks={filtredTasks}
                    onTaskDone={this.hendlerTaskDone} 
                    onTaskDelete={this.hendlerTaskDelete}
                    />
            </div>
        );
    },

    _updateLocalStorage: function(){
        var tasks = JSON.stringify(this.state.tasks);
        localStorage.setItem('tasks', tasks);
    }
});

ReactDOM.render(
    <ToDoListApp />,
    document.getElementById('mount-point')
);