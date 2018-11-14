//record interval to call update
interval_update = null;

/**
 * DashboardCtrl - controller
 */
function DashboardCtrl($scope) {

    $scope.items = [];
    let me = this;

    var fetchinit = {
        credentials: 'same-origin'
    };

    this.update_list = () => {

        fetch('/api/listall', fetchinit).then((response) => {
            return response.json()
        }).then(result => {

            $scope.$apply(function () {
                $scope.items = result;
            });

        });
    }

    $scope.showList = () => {

        me.update_list();

        //return;

        if (!interval_update) {
            interval_update = setInterval(() => {

                me.update_list();

            }, 5000);
        }

    };

    $scope.delete = (version) => {

        fetch(`/api/delete?version=${version}`, fetchinit).then((response) => {
            me.update_list();
        });

    };

    $scope.primary = (version) => {

        fetch(`/api/primary?version=${version}`, fetchinit).then((response) => {
            me.update_list();
        });

    };

    $scope.encrypt = (version) => {

        fetch(`/api/encrypt?version=${version}`, fetchinit).then((response) => {
            me.update_list();
        });

    };

};


/**
 * NewVersionCtrl - controller
 */
function NewVersionCtrl($scope) {

    //Temp nothing

};


angular
    .module('SafeBrowsing')
    .controller('DashboardCtrl', DashboardCtrl)
    .controller('NewVersionCtrl', NewVersionCtrl)