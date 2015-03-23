/*
React Grid

Goals
[x] Simple table structure
[ ] Extendable configuration
  [ ] Config
  [ ] Columns
  [x] Records
[x] Local sorting
[x] Local pagination
[~] Local filter
  [ ] Filter algorithm
  [x] Config: Placeholder
  [x] Config: Timeout setting (to prevent excessive calls)
[x] Editable fields
[x] Custom formatters
[x] Conditional edition
[ ] checkboxes
[ ] Ajax fetch
[ ] Ajax pagination
[ ] Ajax sorting
[ ] ...


Component structure
- Grid
  - Table
    - HeaderRow
      - Cell
    - Row
      - Cell
  - Filter
  - Paginator
    - RecordsPerPageSelector
    - PagePicker (arrows & page numbers)
*/

var ReactGrid = React.createClass({
  getInitialState: function() {
    return {
      records: this.processRecords(),
      columns: this.props.columns
    };
  },

  /*
    Locally process records list based on:
    - filter
    - sorting
    - pagination
  */
  processRecords: function() {
    var processedRecords = this.props.records;

    // filter
    if(config.pagination && config.pagination.filter === true) {
      // ToDo: filter using lodash or God knows what...
    }

    // sorting
    if(this.props.config.sort) {
      processedRecords = this.sorting(processedRecords, this.props.config.sort.currKey, this.props.config.sort.currDirection);
    }

    // pagination
    if(this.props.config.pagination) {
      processedRecords = this.paginate(processedRecords, this.props.config.pagination.currentPage, this.props.config.pagination.perPage);
    }

    return processedRecords;
  },

  // ### listeners
  handleSortChange: function(column) {
    if(this.props.config.sort) {
      if(this.props.config.sort.currKey === column.id) {
        this.props.config.sort.currDirection = this.props.config.sort.currDirection === 'ASC' ? 'DESC' : 'ASC';
      } else {
        this.props.config.sort.currDirection = 'ASC';
        this.props.config.sort.currKey = column.id;
      }

      // reprocess the state of records
      this.setState({
        records: this.processRecords()
      });
    }
  },

  handlePerPageChange: function(perPage) {
    var validValue = !isNaN(Number(perPage));

    if(this.props.config.pagination && validValue) {
      this.props.config.pagination.perPage = perPage;
      this.props.config.pagination.currentPage = 1;

      // reprocess the state of records
      this.setState({
        records: this.processRecords()
      });
    }
  },

  handlePageChange: function(page) {
    page = Number(page);

    if(this.props.config.pagination && !isNaN(page)) {
      this.props.config.pagination.currentPage = page;

      // reprocess the state of records
      this.setState({
        records: this.processRecords()
      });
    }
  },

  handleFilterChange: function(val) {
    if(config.pagination && config.pagination.filter === true) {
      console.log('filter value', val);
      config.pagination.filterValue = val;

      // reprocess the state of records
      this.setState({
        records: this.processRecords()
      });
    }
  },

  handleRowChange: function(newValue, oldValue, record, column) {
    record[column.id] = newValue;
    this.setState({
      records: this.processRecords()
    });
  },

  // ### modifiers
  paginate: function(records, currPage, perPage) {
    if(!perPage) return records;
    currPage = (currPage - 1) > 0 ? (currPage - 1) : 0;
    return records.slice(currPage * perPage, (currPage + 1) * perPage);
  },

  sorting: function(records, key, direction) {
    var records = _.sortBy(records, key);
    if(direction === 'DESC') {
      records = records.reverse();
    }
    return records;
  },

  filter: function(records, filter) {

  },

  render: function() {
    return (
      <div className="reactGrid">
        <Filter
          onChange={this.handleFilterChange} />
        <Table
          records={this.state.records}
          columns={this.state.columns}
          onSort={this.handleSortChange}
          onRowChange={this.handleRowChange} />
        <Paginator
          config={this.props.config.pagination}
          numRecords={this.props.records.length}
          onPerPageChange={this.handlePerPageChange}
          onPageChange={this.handlePageChange} />
      </div>
    );
  }
});

var Table = React.createClass({
  render: function() {
    var cols = this.props.columns;
    var rows = this.props.records.map(function(record) {
      return (
        <Row record={record} columns={cols} onChange={this.props.onRowChange} />
      );
    }, this);

    return (
      <table className="reactGridTable table">
        <thead>
          <HeaderRow
            className="reactGridHeader"
            columns={this.props.columns}
            onSort={this.props.onSort} />
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    );
  }
});

var HeaderRow = React.createClass({
  render: function() {
    var columns = this.props.columns.map(function(column) {
      return (
        <HeaderCell
          column={column}
          onClick={this.props.onSort.bind(null,column)} />
      );
    }, this);

    return (<tr>{columns}</tr>);
  }
});

var HeaderCell = React.createClass({
  render: function() {
    return (
      <th onClick={this.props.onClick}>{this.props.column.title}</th>
    );
  }
});

var Row = React.createClass({
  render: function() {
    var columns = this.props.columns.map(function(column) {
      var value = this.props.record[column.id],
          isEditable = column.editable === true
          || (
            typeof(column.editable) === 'function'
            && column.editable(value, this.props.record) === true
          );

      if(isEditable) {
        return (
          <EditableRowCell
            column={column}
            record={this.props.record}
            onChange={this.props.onChange} />
        );
      } else {
        return (
          <RowCell
            column={column}
            record={this.props.record} />
        );
      }
    }, this);

    return (<tr>{columns}</tr>);
  }
});

var RowCell = React.createClass({
  render: function() {
    var value = this.props.record[this.props.column.id];
    if(typeof(this.props.column.format) === 'function') {
      return (
        <td dangerouslySetInnerHTML = {{__html: this.props.column.format(value)}}></td>
      );
    } /* Not available yet... eventually: special formatters based on string, like format: 'date', format: 'url'.
    else if(typeof(this.props.column.format) === 'string' || typeof(this['render_' + this.props.column.format.toLowerCase()]) === 'function') {
      var method = this['render_' + this.props.column.format.toLowerCase()];
      return (<td dangerouslySetInnerHTML = {{__html: method(value)}}></td>);
    }*/ else {
      return (<td>{value}</td>);
    }
  }
});

var EditableRowCell = React.createClass({
  getInitialState: function() {
    return {
      currentValue: this.props.record[this.props.column.id]
    };
  },

  componentWillReceiveProps: function(newProps) {
    this.setState({
      currentValue: newProps.record[newProps.column.id]
    });
  },

  handleChange: function(event) {
    var value = event.target.value,
        oldValue = this.state.currentValue;

    if(value !== oldValue) {
      this.setState({ currentValue: value });
      // ToDo: cool feature
      // # live saving # ~> saving while typing with a 300ms delay
      // if such config is included, 'onChange' will be called here as well.
      // this.props.onChange(value, oldValue, this.props.column, this.props.record);
    }
  },

  handleBlur: function(event) {
    var value = this.state.currentValue,
        oldValue = this.props.record[this.props.column.id];

    if(value !== oldValue) {
      this.props.onChange(value, oldValue, this.props.record, this.props.column);
    }
  },

  handleSelectChange: function(event) {
    var value = event.target.value,
        oldValue = this.state.currentValue;

    if(value !== oldValue) {
      this.setState({ currentValue: value });
      this.props.onChange(value, oldValue, this.props.record, this.props.column);
    }
  },

  renderTextField: function() {
    return (
      <td>
        <input
          type="text"
          className="form-control"
          value={this.state.currentValue}
          onChange={this.handleChange}
          onBlur={this.handleBlur}
          placeholder={this.props.placeholder || ''} />
      </td>
    );
  },

  renderSelectField: function() {
    var options = this.props.column.choices.map(function(option) {
      return (<option value={option.value}>{option.text}</option>);
    });
    return (
      <td>
        <select
          className="form-control"
          value={this.state.currentValue}
          onChange={this.handleSelectChange}>
          {options}
        </select>
      </td>
    );
  },

  render: function() {
    if(this.props.column.choices) {
      return this.renderSelectField();
    } else {
      return this.renderTextField();
    }
  }
});

var Paginator = React.createClass({
  getInitialState: function() {
    var recordsPerPage = this.props.config.perPage || this.props.config.perPageOptions[0];
    return {
      currentOption: recordsPerPage,
      currentPage: 1,
      numPages: this.computeNumPages(this.props.numRecords, recordsPerPage)
    };
  },

  componentWillReceiveProps: function(nextProps) {
    this.setState({
      numPages: this.computeNumPages(nextProps.numRecords, nextProps.config.perPage)
    });
  },

  computeNumPages: function(records, recordsPerPage) {
    return Math.ceil(records / recordsPerPage);
  },

  render: function() {
    return (
      <div>
        <PerPageSelector
          currentOption={this.state.currentOption}
          options={this.props.config.perPageOptions}
          onChange={this.props.onPerPageChange} />
        // Pending RecordsCounter
        <PageSelector
          currentPage={this.state.currentPage}
          numPages={this.state.numPages}
          onChange={this.props.onPageChange} />
      </div>
    );
  }
});

var PerPageSelector = React.createClass({
  getInitialState: function() {
    return {
      currentOption: this.props.currentOption
    };
  },

  handleChange: function(e) {
    var newOption = e.target.value;
    this.setState({currentOption: newOption});
    this.props.onChange(newOption);
  },

  render: function() {
    var options = this.props.options.map(function(option) {
      return (
        <option value={option}>{option}</option>
      );
    });
    return (
      <select
        className="form-control"
        value={this.state.currentOption}
        onChange={this.handleChange}>
        {options}
      </select>
    );
  }
});

var PageSelector = React.createClass({
  getInitialState: function() {
    var minMax = this.computePages(this.props.currentPage, this.props.numPages);
    return {
      minPage: minMax[0],
      maxPage: minMax[1],
      currentPage: this.props.currentPage
    };
  },

  componentWillReceiveProps: function(nextProps) {
    // update state only if num pages changed
    if(nextProps.numPages !== this.props.numPages) {
      var minMax = this.computePages(this.props.currentPage, nextProps.numPages);
      this.setState({
        minPage: minMax[0],
        maxPage: minMax[1],
        currentPage: nextProps.currentPage
      });
    }
  },

  computePages: function(currentPage, numPages) {
    if(numPages <= 5) {
      return [1, numPages];
    } else if(currentPage < 3) {
      return [1, 5];
    } else if(currentPage > (numPages - 2)) {
      return [numPages - 4, numPages];
    } else {
      return [currentPage - 2, currentPage + 2];
    }
  },

  handlePageClick: function(page) {
    if(page !== this.state.currentPage && page >= 1 && page <= this.props.numPages) {
      var minMax = this.computePages(page, this.props.numPages);
      this.setState({
        minPage: minMax[0],
        maxPage: minMax[1],
        currentPage: page
      });
      this.props.onChange(page);
    }
  },

  renderPageNumbers: function() {
    // compute pages before and after current one
    var i = this.state.minPage,
        pages = [];
    for (; i <= this.state.maxPage; i++) {
      pages.push(
        <li className={i === this.state.currentPage ? "active" : ""}>
          <a href="#" onClick={this.handlePageClick.bind(null, i)}>{i}</a>
        </li>
      );
    }
    return pages;
  },

  renderPrevPageLink: function() {
    return (
      <li className={this.state.currentPage == 1 ? "disabled" : ""}>
        <a href="#" aria-label="Previous" onClick={this.handlePageClick.bind(null, this.state.currentPage - 1)}>
          <span aria-hidden="true">&laquo;</span>
        </a>
      </li>
    );
  },

  renderNextPageLink: function() {
    return (
      <li className={this.state.currentPage == this.props.numPages ? "disabled" : ""}>
        <a href="#" aria-label="Next" onClick={this.handlePageClick.bind(null, this.state.currentPage + 1)}>
          <span aria-hidden="true">&raquo;</span>
        </a>
      </li>
    );
  },

  render: function() {
    return (
      <nav>
        <ul className="pagination">
          {this.renderPrevPageLink()}
          {this.renderPageNumbers()}
          {this.renderNextPageLink()}
        </ul>
      </nav>
    );
  }
});

/*
  Config:
  filterDelayMs (int): milliseconds to wait for the filter refresh (def: 300),
  placeholder (string): filter input field's placeholder (def: "Filter records...")
*/
var Filter = React.createClass({
  timeoutHandler: null,

  handleChange: function(event) {
    var newFilter = event.target.value;

    if(this.timeoutHandler) {
      clearTimeout(this.timeoutHandler);
    }

    this.timeoutHandler = setTimeout(function() {
      this.props.onChange(newFilter);
    }.bind(this), this.props.filterDelayMs || 300);
  },

  render: function() {
    return (
      <input className="form-control" type="text" onChange={this.handleChange} placeholder={this.props.placeholder || "Filter records..."} />
    );
  }
});
