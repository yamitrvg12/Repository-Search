import React, { Component } from 'react';
import moment from 'moment';

import './App.css';

import FontAwesome from 'react-fontawesome';

const FILTER_OPTIONS = ['Created', 'Updated', 'Pushed', 'Full Name'];

class FormularioBusqueda extends Component {

  constructor(props) {
    super(props);

    this.state = {
      usuario: props.usuario,
      incluirMiembro: props.incluirMiembro,
      sort: props.sort
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleUsuario = this.handleUsuario.bind(this);
    this.handleIncluirMiembro = this.handleIncluirMiembro.bind(this);
    this.handleSort = this.handleSort.bind(this);
  }

  handleSubmit(ev) {
    ev.preventDefault();
    this.props.onBuscar({
      usuario: this.state.usuario,
      incluirMiembro: this.state.incluirMiembro,
      sort: this.state.sort
    });
  }

  handleUsuario(ev) {
    this.setState({
      usuario: ev.target.value
    });
  }

  handleIncluirMiembro(ev) {
    this.setState({
      incluirMiembro: ev.target.checked
    });
  }

  handleSort(value) {
    this.setState({
      sort: value
    });
  }

  render() {
    return(
      <form className="formulario-busqueda" onSubmit={this.handleSubmit}>
        <input 
          type="text" 
          className="input-usuario"
          value={this.state.usuario}
          onChange={this.handleUsuario}
        />
        <label className="check-miembro">
          <input 
            type="checkbox" 
            checked={this.state.incluirMiembro}
            onChange={this.handleIncluirMiembro}
          /> Incluir repositorios donde el usuario es miembro
        </label>
        <Dropdown
          id={'filter-results'}
          type={'select'}
          title={'Ordenar por'}
          options={FILTER_OPTIONS}
          onClickFilter={this.handleSort}
        />
        <button className="formulario-submit" type="submit"><FontAwesome name="search" /></button>
      </form>
    );
  }
}

class ItemResultado extends Component {
  render() {
    var resultado = this.props.resultado;
    return (
      <li className="resultado">
        <h3>
          <a href={resultado.html_url} target="_blank">
            {resultado.name}
          </a> {resultado.private && <span className="resultado-privado">Privado</span>}
        </h3>
        <p className="resultado-info">
          {resultado.fork && <span className="resultado-fork">
              <FontAwesome name="code-fork" /> Forkeado
            </span>}
        </p>
        <p className="resultado-descripcion">{resultado.description}</p>
        <p className="resultado-actualizado">Actualizado {moment(resultado.updated_at).fromNow()}</p>
        <div className="resultado-stats">
          <span className="resultado-stat">
            {resultado.language}
          </span>
          <span className="resultado-stat">
            <FontAwesome name="code-fork" /> {resultado.forks_count}
          </span>
          <span className="resultado-stat">
            <FontAwesome name="star" /> {resultado.stargazers_count}
          </span>
          <span className="resultado-stat">
            <FontAwesome name="eye" /> {resultado.watchers_count}
          </span>
        </div>
      </li>
    );
  }
}

class Resultados extends Component {
  render() {
    return (
      <ul className="resultados-lista">
        {this.props.resultados.map(function(resultado) {
          return <ItemResultado key={resultado.id} resultado={resultado} />;
        })}
      </ul>
    );
  }
}

class ResultStats extends Component {
  render() {
    return(
      <div className="result-stats">
        {this.props.totalResult} Resultados Encontrados
      </div>
    );
  }
}

class Dropdown extends Component {

  constructor() {
    super();

    this.handleFilter = this.handleFilter.bind(this);
  }

  handleFilter(ev) {
    let value = ev.target.value.toLowerCase().replace(/\s/g,"_");

    this.props.onClickFilter(value);
  }

  render() {
    return(
      <label className="sort" htmlFor={this.props.id}>
        <span className="sort-label">
          {this.props.title} 
        </span>
        <select id={this.props.id} name={this.props.id} onChange={this.handleFilter}>
          {this.props.options.map((option, key) => {
            return <option key={key} value={option}>{option}</option>
          })}
        </select>
      </label>
    );
  }
}

class App extends Component {

  constructor() {
    super();

    this.state = {
      resultados: [],
      usuario: 'gaearon',
      incluirMiembro: false,
      totalResult: '',
      sort: FILTER_OPTIONS[0].toLowerCase()
    };

    this.cambiarCriterioBusqueda = this.cambiarCriterioBusqueda.bind(this);
  }

  componentDidMount() {
    this.buscarResultados(this.state);
  }

  buscarResultados(params) {
    var url = `https://api.github.com/users/${params.usuario}/repos?sort=${params.sort}`;

    if(params.incluirMiembro) {
      url += '&type=all';
    }

    fetch(url).then(function(response){
      if(response.ok) {
        response.json().then(function(body){
          this.setState({
            resultados: body,
            totalResult: body.length
          });
        }.bind(this));
      } else {
        this.setState({
          resultados: [],
          totalResult: '0'
        });
      }
    }.bind(this));
  }

  cambiarCriterioBusqueda(state) {
    this.setState(state);
    this.buscarResultados(state);
  }

  render() {
    return (
      <div className="App">
        <header className="header">
          <div className="holder">
            <div className="search">
              <FormularioBusqueda
                usuario={this.state.usuario}
                incluirMiembro={this.state.incluirMiembro}
                sort={this.state.sort}
                onBuscar={this.cambiarCriterioBusqueda}
              />
            </div>
          </div>
        </header>
        <div className="extabar">
          <div className="holder">
            <ResultStats totalResult={this.state.totalResult} />
          </div>
        </div>
        <div className="holder">
          <Resultados
            resultados={this.state.resultados}
          />
        </div>
      </div>
    );
  }
}

export default App;